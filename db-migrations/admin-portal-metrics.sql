-- Production admin metrics support for JobWest.
-- Keeps public data protected by RLS while allowing admin users to review portal-wide totals.

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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'jobs'
      AND policyname = 'Admins can read all jobs'
  ) THEN
    CREATE POLICY "Admins can read all jobs"
    ON public.jobs
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1
        FROM public.users
        WHERE users.id = (select auth.uid())
          AND users.role IN ('admin', 'owner')
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'payments'
      AND policyname = 'Admins can read all payments'
  ) THEN
    CREATE POLICY "Admins can read all payments"
    ON public.payments
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1
        FROM public.users
        WHERE users.id = (select auth.uid())
          AND users.role IN ('admin', 'owner')
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'users'
      AND policyname = 'Admins can read users'
  ) THEN
    CREATE POLICY "Admins can read users"
    ON public.users
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1
        FROM public.users admin_user
        WHERE admin_user.id = (select auth.uid())
          AND admin_user.role IN ('admin', 'owner')
      )
    );
  END IF;
END $$;
