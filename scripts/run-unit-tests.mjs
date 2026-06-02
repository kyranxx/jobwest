import jitiModule from "jiti"

const jiti = jitiModule(`${process.cwd()}/`, {
  alias: {
    "@": process.cwd(),
  },
})

jiti("./tests/admin-metrics.test.ts")
jiti("./tests/auth-callback-profile.test.mjs")
jiti("./tests/csp.test.ts")
jiti("./tests/security-headers.test.ts")
jiti("./tests/public-files.test.ts")
jiti("./tests/breadcrumbs.test.ts")
jiti("./tests/check-email-privacy.test.mjs")
jiti("./tests/header-auth-state.test.mjs")
jiti("./tests/import-real-jobs.test.ts")
jiti("./tests/job-publishing.test.ts")
jiti("./tests/marketing-integrations.test.ts")
await import("../tests/edit-ad-route.test.mjs")
await import("../tests/public-route-indexes.test.mjs")
await import("../tests/website-standards.test.mjs")
jiti("./tests/portal-registry.test.ts")
jiti("./tests/supabase-env.test.ts")
await import("../tests/guard-production-build.test.mjs")
await import("../tests/ci-runtime-readiness.test.mjs")
await import("../tests/documented-runtime-commands.test.mjs")
await import("../tests/employer-job-portal-scope.test.mjs")
await import("../tests/job-source-portal-scope.test.mjs")
await import("../tests/job-source-demo-boundary.test.mjs")
await import("../tests/migration-runtime-alignment.test.mjs")
await import("../tests/e2e-runner.test.mjs")
await import("../tests/no-production-debug-routes.test.mjs")
await import("../tests/node-runtime-scripts.test.mjs")
await import("../tests/production-baseline-migration.test.mjs")
await import("../tests/payment-success-demo-mode.test.mjs")
await import("../tests/settings-password-reauth.test.mjs")
await import("../tests/stripe-checkout-route.test.mjs")
await import("../tests/stripe-secret-site-mode.test.mjs")
await import("../tests/stripe-webhook-route.test.mjs")
await import("../tests/storage-readiness.test.mjs")
await import("../tests/vercel-readiness-helpers.test.mjs")

console.log("Unit tests passed")
