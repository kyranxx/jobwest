import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"

const checkoutRoute = readFileSync("app/api/stripe/checkout/route.ts", "utf8")
const checkEmailRoute = readFileSync("app/api/check-email/route.ts", "utf8")
const authForm = readFileSync("components/auth/auth-form.tsx", "utf8")
const csp = readFileSync("lib/csp.ts", "utf8")
const verifier = readFileSync("scripts/verify-production-readiness.mjs", "utf8")
const envExample = readFileSync(".env.example", "utf8")
const rateLimitMigrationPath = "db-migrations/api-rate-limits.sql"
const rateLimitMigration = existsSync(rateLimitMigrationPath)
  ? readFileSync(rateLimitMigrationPath, "utf8")
  : ""

for (const route of [checkoutRoute, checkEmailRoute]) {
  assert.match(route, /enforceSameOriginRequest\(/)
  assert.match(route, /checkRateLimit\(/)
}

assert.match(checkEmailRoute, /verifyTurnstileToken\(/)
assert.match(authForm, /TurnstileWidget/)
assert.match(authForm, /captchaToken/)
assert.match(authForm, /NEXT_PUBLIC_TURNSTILE_SITE_KEY/)

assert.match(csp, /https:\/\/challenges\.cloudflare\.com/)
assert.match(verifier, /NEXT_PUBLIC_TURNSTILE_SITE_KEY/)
assert.match(verifier, /TURNSTILE_SECRET_KEY/)
assert.match(envExample, /NEXT_PUBLIC_TURNSTILE_SITE_KEY=/)
assert.match(envExample, /TURNSTILE_SECRET_KEY=/)
assert.equal(existsSync(rateLimitMigrationPath), true)
assert.match(rateLimitMigration, /CREATE TABLE IF NOT EXISTS private\.api_rate_limits/i)
assert.match(rateLimitMigration, /CREATE OR REPLACE FUNCTION public\.check_api_rate_limit/i)
