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

Current launch evidence:

Previously evidenced complete:

- Supabase is on active project `uaphhpgvvbwwaicjmwdp`.
- The production profile trigger migration was applied and verified.
- A prior production deploy gate passed, and `jobwest.sk` was previously aliased and smoke-tested clean.
- Google Search Console, GA4, and IndexNow were previously connected or submitted.

Currently locally verified:

- Local checks pass: `pnpm test:unit`, `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build`, and `pnpm e2e`.
- `pnpm verify:deploy` passes locally, including Vercel Production env names and Supabase REST reachability.
- The current branch has local commits that have not been pushed or deployed.

Not currently reverified:

- Current live DNS, alias, and public site behavior.
- Actual server-side sensitive production secret values, because Vercel may hide them from local env pulls.
- Stripe production webhook endpoint and signing secret.
- Current GTM and Microsoft Clarity completion state.

Owner-gated launch inventory:

- Approve at least one real Slovak job ad with contact info for the `sk` portal.
- Authorize any live inventory check or `pnpm verify:production` run before calling the site live.
- Optional and non-blocking: resume Bing setup when convenient.

Detailed cutover steps: `docs/production-cutover.md`.
