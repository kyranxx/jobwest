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

This checks production secrets, Supabase reachability/schema, at least one real job ad with contact info, and Stripe access. Production builds on Vercel run this deploy gate before `next build`; preview and local builds do not block on production secrets.

Before switching DNS or calling the site live, run:

```bash
pnpm verify:production
```

This includes the deploy checks plus the public DNS check for `jobwest.sk`.

To check the actual Vercel production env locally:

```bash
vercel env pull .env.production.local --environment=production --yes
pnpm verify:production .env.production.local
pnpm verify:deploy .env.production.local
```

This checks that production Supabase, Stripe, portal domain, job contact fields, and admin metric schema are configured. It is expected to fail while secrets are missing or placeholders.

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
- Point Websupport DNS apex record to Vercel: `A jobwest.sk 76.76.21.21`.
- Fix `NEXT_PUBLIC_SUPABASE_URL` to an active Supabase project if the current host does not resolve.
- Apply production Supabase migrations:
  - `db-migrations/00-production-baseline.sql` for a fresh project
  - `db-migrations/payments-and-highlights.sql`
  - `db-migrations/admin-portal-metrics.sql`
  - `db-migrations/job-contact-info.sql`
  - `db-migrations/avatar-storage.sql`
- Import at least one approved real job ad with contact info for the `sk` portal.

Detailed cutover steps: `docs/production-cutover.md`.
