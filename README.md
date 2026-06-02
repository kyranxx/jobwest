# JobWest

Slovak job portal for work abroad.

## Local Verification

```bash
pnpm test:unit
pnpm lint
pnpm exec tsc --noEmit
pnpm build
pnpm e2e
```

## Production Readiness

Before deploying production, run:

```bash
pnpm verify:deploy
```

This checks production config, Supabase reachability, and Vercel Production env names. Production builds on Vercel also verify the injected production secrets, Supabase schema, and Stripe access before `next build`. Sensitive Vercel values may remain blank after a local env pull. Development production deploys may have zero job ads.

Marketing and SEO connection env vars:

```bash
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
NEXT_PUBLIC_BING_SITE_VERIFICATION=
NEXT_PUBLIC_AHREFS_SITE_VERIFICATION=
INDEXNOW_KEY=
NEXT_PUBLIC_GTM_ID=
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_MICROSOFT_CLARITY_ID=
NEXT_PUBLIC_GOOGLE_ADS_ID=
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_LINKEDIN_PARTNER_ID=
```

Set these in the production build environment before deploying. Analytics and marketing tags are loaded only after cookie consent.

Before switching DNS or calling the site live, run:

```bash
pnpm verify:production
```

This includes the deploy checks, the public DNS check for `jobwest.sk`, and at least one approved real job ad with contact info.

To check the actual Vercel production env locally:

```bash
vercel env pull .env.production.local --environment=production --yes
pnpm verify:production .env.production.local
pnpm verify:deploy .env.production.local
```

This checks the locally available production config, portal domain, job contact fields, and linked Vercel env names. Sensitive Vercel values may remain blank locally even when configured; their live API checks run inside Vercel Production builds.

To load initial real ads after agencies approve the content, prepare a JSON array using `outreach/initial-real-jobs.template.json` as the file shape, then run a dry run first:

```bash
pnpm jobs:import path/to/real-jobs.json --validate-only
pnpm jobs:import path/to/real-jobs.json --env=.env.production.local
pnpm jobs:import path/to/real-jobs.json --env=.env.production.local --commit
```

The importer rejects placeholder text, placeholder contact domains, missing contact info, duplicate ads, mismatched portal domains, and salaries without a supported currency.

Current go-live blockers:

- Set Vercel Production `SUPABASE_SERVICE_ROLE_KEY`.
- Set Vercel Production `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`.
- Create a Stripe production webhook endpoint for `https://jobwest.sk/api/stripe/webhook` with `checkout.session.completed`.
- Set Vercel Production marketing/SEO IDs for GSC, Bing, Ahrefs, IndexNow, GTM, GA4, and Clarity.
- Point Websupport DNS apex record to Vercel: `A jobwest.sk 76.76.21.21`.
- Fix `NEXT_PUBLIC_SUPABASE_URL` to an active Supabase project if the current host does not resolve.
- Apply production Supabase migrations:
  - `db-migrations/00-production-baseline.sql` for a fresh project
  - `db-migrations/payments-and-highlights.sql`
  - `db-migrations/admin-portal-metrics.sql`
  - `db-migrations/job-contact-info.sql`
  - `db-migrations/avatar-storage.sql`
  - `db-migrations/auth-user-profile-trigger.sql`
- Import at least one approved real job ad with contact info for the `sk` portal.

Detailed cutover steps: `docs/production-cutover.md`.
