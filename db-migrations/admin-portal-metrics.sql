-- Production admin metrics support for JobWest.
-- Keeps public data protected by RLS while allowing admin users to review portal-wide totals.

CREATE SCHEMA IF NOT EXISTS private;

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS portal_code text DEFAULT 'sk',
  ADD COLUMN IF NOT EXISTS portal_domain text DEFAULT 'jobwest.sk';

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS portal_code text DEFAULT 'sk',
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS jobs_portal_code_idx ON public.jobs(portal_code);
CREATE INDEX IF NOT EXISTS payments_portal_code_idx ON public.payments(portal_code);
CREATE INDEX IF NOT EXISTS payments_user_id_idx ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS payments_status_created_at_idx ON public.payments(status, created_at DESC);

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
