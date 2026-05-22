-- Fix recursive admin RLS policies created by the admin metrics migration.
-- Keep the admin lookup in an unexposed private schema so public.users policies
-- do not query public.users again during policy evaluation.

CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.is_jobwest_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'owner')
  );
$$;

REVOKE ALL ON FUNCTION private.is_jobwest_admin() FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_jobwest_admin() TO authenticated;

DROP POLICY IF EXISTS "Admins can read all jobs" ON public.jobs;
CREATE POLICY "Admins can read all jobs"
ON public.jobs
FOR SELECT
TO authenticated
USING (private.is_jobwest_admin());

DROP POLICY IF EXISTS "Admins can read all payments" ON public.payments;
CREATE POLICY "Admins can read all payments"
ON public.payments
FOR SELECT
TO authenticated
USING (private.is_jobwest_admin());

DROP POLICY IF EXISTS "Admins can read users" ON public.users;
CREATE POLICY "Admins can read users"
ON public.users
FOR SELECT
TO authenticated
USING (private.is_jobwest_admin());
