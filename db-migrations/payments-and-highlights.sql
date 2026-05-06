-- Optional production schema for JobWest payments/highlights.
-- Demo mode works without this, but real CRUD/highlight persistence needs these columns.

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

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their payments"
ON public.payments
FOR SELECT
USING ((select auth.uid()) = user_id);
