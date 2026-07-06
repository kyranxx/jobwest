-- Durable per-route rate limit buckets for public API abuse controls.

CREATE SCHEMA IF NOT EXISTS private;

CREATE TABLE IF NOT EXISTS private.api_rate_limits (
  key text NOT NULL,
  bucket_start timestamptz NOT NULL,
  count integer NOT NULL DEFAULT 0,
  PRIMARY KEY (key, bucket_start)
);

CREATE OR REPLACE FUNCTION public.check_api_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private, pg_temp
AS $$
DECLARE
  current_bucket timestamptz;
  next_count integer;
BEGIN
  IF p_key IS NULL OR p_key = '' OR p_limit < 1 OR p_window_seconds < 1 THEN
    RETURN false;
  END IF;

  current_bucket := to_timestamp(
    floor(extract(epoch FROM now()) / p_window_seconds) * p_window_seconds
  );

  DELETE FROM private.api_rate_limits
  WHERE bucket_start < now() - make_interval(secs => p_window_seconds * 4);

  INSERT INTO private.api_rate_limits (key, bucket_start, count)
  VALUES (p_key, current_bucket, 1)
  ON CONFLICT (key, bucket_start)
  DO UPDATE SET count = private.api_rate_limits.count + 1
  RETURNING count INTO next_count;

  RETURN next_count <= p_limit;
END;
$$;

REVOKE ALL ON FUNCTION public.check_api_rate_limit(text, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_api_rate_limit(text, integer, integer) TO service_role;
