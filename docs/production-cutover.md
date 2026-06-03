# JobWest Production Cutover

Use this order to avoid sending `jobwest.sk` to an old or incomplete deployment.

## 1. Current Evidence

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

## 2. Confirm Production Inventory

Do not run live checks until the owner approves a launch inventory pass.

When approved, confirm:

- Vercel Production still has the required env names.
- Supabase REST is reachable for the configured production project.
- Stripe Dashboard has a production webhook endpoint:

```txt
https://jobwest.sk/api/stripe/webhook
```

Enable at least this event:

```txt
checkout.session.completed
```

Save the endpoint signing secret as Vercel Production `STRIPE_WEBHOOK_SECRET`.

Keep these public values:

```bash
NEXT_PUBLIC_SITE_URL=https://jobwest.sk
NEXT_PUBLIC_PORTAL_CODE=sk
NEXT_PUBLIC_PORTAL_DOMAIN=jobwest.sk
NEXT_PUBLIC_APP_URL=https://jobwest.sk
```

## 3. Verify Deploy Readiness

Import approved real job ads before the public launch. Development production deploys may have zero ads. Do not import placeholders or unapproved scraped ads.

```bash
pnpm jobs:import path/to/real-jobs.json --validate-only
pnpm jobs:import path/to/real-jobs.json --env=.env.production.local
pnpm jobs:import path/to/real-jobs.json --env=.env.production.local --commit
```

The JSON file must be an array of real ads with: `company`, `contact_info`, `title`, `description`, `category`, `country_code`, `location`, `salary`, `job_type`, `accommodation_provided`, and `accommodation_paid`.
Use `--validate-only` before importing; it checks JSON shape, placeholder text, duplicate rows in the file, real contact data, supported salary currency, and that `portal_code` matches the registered `portal_domain`.

```bash
pnpm verify:deploy
```

This must pass before deploying production. It validates infrastructure but allows zero job ads while the app is still being built. When run locally from this linked repo, the verifier checks pulled public config and the linked Vercel project env names. Sensitive Vercel values may remain blank after a local pull. Vercel production builds run the same deploy gate without Vercel CLI self-inspection, because the build receives the real production secrets directly and verifies the Supabase schema plus Stripe API. If you need a local-only check without calling Vercel CLI, run:

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
