-- Optional production schema for JobWest payments/highlights.
-- Demo mode works without this, but real CRUD/highlight persistence needs these columns.

CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS company text,
  ADD COLUMN IF NOT EXISTS accommodation_provided boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS accommodation_included boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS accommodation_paid boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS highlight_tier text DEFAULT 'standard'
    CHECK (highlight_tier IN ('standard', 'top', 'exclusive')),
  ADD COLUMN IF NOT EXISTS topped_at timestamptz;

CREATE INDEX IF NOT EXISTS jobs_user_id_idx ON public.jobs(user_id);
CREATE INDEX IF NOT EXISTS jobs_highlight_sort_idx ON public.jobs(highlight_tier, topped_at DESC, created_at DESC);

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  job_id bigint REFERENCES public.jobs(id) ON DELETE SET NULL,
  stripe_session_id text UNIQUE,
  tier text NOT NULL CHECK (tier IN ('top', 'exclusive', 'add-ad')),
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'eur',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS job_id bigint REFERENCES public.jobs(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS stripe_session_id text,
  ADD COLUMN IF NOT EXISTS tier text DEFAULT 'add-ad',
  ADD COLUMN IF NOT EXISTS amount_cents integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'eur',
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS portal_code text DEFAULT 'sk',
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

UPDATE public.payments
SET
  tier = COALESCE(tier, 'add-ad'),
  amount_cents = COALESCE(amount_cents, 0),
  currency = COALESCE(currency, 'eur'),
  status = COALESCE(status, 'pending'),
  portal_code = COALESCE(portal_code, 'sk'),
  created_at = COALESCE(created_at, now());

ALTER TABLE public.payments
  ALTER COLUMN id SET NOT NULL,
  ALTER COLUMN tier SET NOT NULL,
  ALTER COLUMN amount_cents SET NOT NULL,
  ALTER COLUMN currency SET NOT NULL,
  ALTER COLUMN status SET NOT NULL,
  ALTER COLUMN created_at SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'payments_tier_check'
      AND conrelid = 'public.payments'::regclass
  ) THEN
    ALTER TABLE public.payments
      ADD CONSTRAINT payments_tier_check CHECK (tier IN ('top', 'exclusive', 'add-ad'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.payments'::regclass
      AND contype = 'p'
  ) THEN
    ALTER TABLE public.payments
      ADD CONSTRAINT payments_pkey PRIMARY KEY (id);
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS payments_stripe_session_id_key
ON public.payments(stripe_session_id);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'payments'
      AND policyname = 'Users can read own payments'
  ) THEN
    CREATE POLICY "Users can read own payments"
    ON public.payments
    FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = user_id);
  END IF;
END $$;
