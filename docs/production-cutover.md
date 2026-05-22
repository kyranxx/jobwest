# JobWest Production Cutover

Use this order to avoid sending `jobwest.sk` to an old or incomplete deployment.

## 1. Fix Production Supabase

- Choose the real JobWest Supabase project. The current Vercel production URL `iuzmhwjdlywbhtgzuyib.supabase.co` does not resolve.
- For a fresh JobWest Supabase project, apply the baseline first:
  - `db-migrations/00-production-baseline.sql`
- For an existing project, apply the incremental migrations that are still missing:
  - `db-migrations/payments-and-highlights.sql`
  - `db-migrations/admin-portal-metrics.sql`
  - `db-migrations/job-contact-info.sql`
  - `db-migrations/avatar-storage.sql`
- Confirm these columns exist:
  - `jobs.portal_code`
  - `jobs.portal_domain`
  - `jobs.contact_info`
  - `payments.portal_code`
  - `payments.id`
  - `payments.user_id`
  - `payments.job_id`
  - `payments.stripe_session_id`
  - `payments.tier`
  - `payments.amount_cents`
  - `payments.currency`
  - `payments.status`
  - `users.role`
- Confirm the `avatars` Supabase Storage bucket exists and has authenticated upload/update policies plus public read access.
- Confirm the Data API can read public jobs with the anon key. The baseline explicitly grants `SELECT` on `public.jobs` to `anon` and `authenticated`.

## 2. Set Vercel Production Env

Set these in Vercel Production:

```bash
vercel env rm NEXT_PUBLIC_SUPABASE_URL production --yes
vercel env rm NEXT_PUBLIC_SUPABASE_ANON_KEY production --yes
vercel env rm SUPABASE_SERVICE_ROLE_KEY production --yes
vercel env rm STRIPE_SECRET_KEY production --yes
vercel env rm STRIPE_WEBHOOK_SECRET production --yes
```

Then add the real values:

Prefer the Vercel dashboard for secrets so values are not written to shell history.

If using CLI, write values without a trailing newline. In PowerShell:

```powershell
$env:JOBWEST_ENV_VALUE = "<real-value>"
node -e "process.stdout.write(process.env.JOBWEST_ENV_VALUE)" | vercel env add STRIPE_SECRET_KEY production
Remove-Item Env:\JOBWEST_ENV_VALUE
```

Repeat the same pattern for:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

Keep these public values:

```bash
NEXT_PUBLIC_SITE_URL=https://jobwest.sk
NEXT_PUBLIC_PORTAL_CODE=sk
NEXT_PUBLIC_PORTAL_DOMAIN=jobwest.sk
NEXT_PUBLIC_APP_URL=https://jobwest.sk
```

## 3. Verify Deploy Readiness

In Stripe Dashboard, create a production webhook endpoint:

```txt
https://jobwest.sk/api/stripe/webhook
```

Enable at least this event:

```txt
checkout.session.completed
```

Save the endpoint signing secret as Vercel Production `STRIPE_WEBHOOK_SECRET`.

Import approved real job ads before deploying. Do not import placeholders or unapproved scraped ads.

```bash
pnpm jobs:import path/to/real-jobs.json --validate-only
pnpm jobs:import path/to/real-jobs.json --env=.env.production.local
pnpm jobs:import path/to/real-jobs.json --env=.env.production.local --commit
```

The JSON file must be an array of real ads with: `company`, `contact_info`, `title`, `description`, `category`, `country_code`, `location`, `salary`, `job_type`, `accommodation_provided`, and `accommodation_paid`.
Use `--validate-only` while Supabase is still being fixed; it checks JSON shape, placeholder text, duplicate rows in the file, real contact data, supported salary currency, and that `portal_code` matches the registered `portal_domain`.

```bash
vercel env pull .env.production.local --environment=production --yes
pnpm verify:deploy
```

This must pass before deploying production. When run locally from this linked repo, the verifier checks both pulled env values and the linked Vercel project env names. Vercel production builds run the same deploy gate without Vercel CLI self-inspection, because the build already receives the production env directly. If you need a local-only check without calling Vercel CLI, run:

```bash
pnpm verify:deploy -- --skip-vercel
```

## 4. Deploy Production

Deploy only after `pnpm verify:deploy` passes.

```bash
vercel --prod
```

Do not switch Websupport DNS before the new production deployment is ready.

## 5. Switch DNS

At Websupport, set the apex record:

```txt
A jobwest.sk 76.76.21.21
```

Then wait for DNS propagation.

## 6. Verify Go-Live

```bash
vercel env pull .env.production.local --environment=production --yes
pnpm verify:production
```

This must pass before calling `jobwest.sk` live. It checks DNS and Vercel domain configuration, so both the public A record and Vercel domain status must be clean.
