-- Enforce the public job form validation at the database boundary.
-- NOT VALID avoids blocking deploys on older dirty rows while still protecting new writes.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'jobs_company_required') THEN
    ALTER TABLE public.jobs
      ADD CONSTRAINT jobs_company_required
      CHECK (company IS NOT NULL AND length(btrim(company)) >= 2) NOT VALID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'jobs_contact_info_required') THEN
    ALTER TABLE public.jobs
      ADD CONSTRAINT jobs_contact_info_required
      CHECK (contact_info IS NOT NULL AND length(btrim(contact_info)) >= 5 AND contact_info ~* '(@|\+[0-9]{3,}|http|www\.)') NOT VALID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'jobs_title_required') THEN
    ALTER TABLE public.jobs
      ADD CONSTRAINT jobs_title_required
      CHECK (title IS NOT NULL AND length(btrim(title)) >= 5) NOT VALID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'jobs_description_required') THEN
    ALTER TABLE public.jobs
      ADD CONSTRAINT jobs_description_required
      CHECK (description IS NOT NULL AND length(btrim(description)) >= 40) NOT VALID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'jobs_category_required') THEN
    ALTER TABLE public.jobs
      ADD CONSTRAINT jobs_category_required
      CHECK (category IS NOT NULL AND length(btrim(category)) >= 1) NOT VALID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'jobs_country_code_required') THEN
    ALTER TABLE public.jobs
      ADD CONSTRAINT jobs_country_code_required
      CHECK (country_code IS NOT NULL AND length(btrim(country_code)) >= 1) NOT VALID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'jobs_location_required') THEN
    ALTER TABLE public.jobs
      ADD CONSTRAINT jobs_location_required
      CHECK (location IS NOT NULL AND length(btrim(location)) >= 2) NOT VALID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'jobs_salary_required') THEN
    ALTER TABLE public.jobs
      ADD CONSTRAINT jobs_salary_required
      CHECK (salary IS NOT NULL AND length(btrim(salary)) >= 3 AND salary ~* '\b(EUR|CHF|GBP)\b') NOT VALID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'jobs_job_type_required') THEN
    ALTER TABLE public.jobs
      ADD CONSTRAINT jobs_job_type_required
      CHECK (job_type IS NOT NULL AND length(btrim(job_type)) >= 1) NOT VALID;
  END IF;
END $$;
