-- Dedicated contact field for production job ads.
-- Keeps candidate contact details visible in the job detail instead of burying them in free text.

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS contact_info text;
