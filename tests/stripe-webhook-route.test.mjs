import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const webhookRoute = readFileSync("app/api/stripe/webhook/route.ts", "utf8")

assert.match(webhookRoute, /const numericJobId = Number\(jobId\)/)
assert.match(webhookRoute, /isLiveStripeSecretForSite\(stripeSecretKey, siteConfig\.url\)/)
assert.match(webhookRoute, /!Number\.isInteger\(numericJobId\).*!\s*userId/s)
assert.match(webhookRoute, /session\.payment_status !== "paid"/)
assert.match(webhookRoute, /amount !== selectedTier\.amount \|\| currency !== "eur"/)
assert.match(webhookRoute, /\.select\("id,user_id,portal_code"\)/)
assert.match(webhookRoute, /paidJob\.user_id !== userId/)
assert.match(webhookRoute, /\(paidJob\.portal_code \|\| siteConfig\.portalCode\) !== currentPortalCode/)
assert.match(webhookRoute, /\.eq\("user_id", userId\)/)
assert.match(webhookRoute, /\.eq\("portal_code", currentPortalCode\)/)
assert.match(webhookRoute, /\.select\("id"\)\s*\.maybeSingle\(\)/)
