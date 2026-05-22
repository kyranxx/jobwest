import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const checkoutRoute = readFileSync("app/api/stripe/checkout/route.ts", "utf8")

assert.match(checkoutRoute, /body = await request\.json\(\)/)
assert.match(checkoutRoute, /highlightSchema\.safeParse\(body\)/)
assert.match(checkoutRoute, /Neplatná požiadavka/)
assert.match(checkoutRoute, /Vyberte platný balík a inzerát/)
assert.match(checkoutRoute, /\.select\("id,portal_code"\)/)
assert.match(checkoutRoute, /\.eq\("user_id", user\.id\)/)
assert.match(checkoutRoute, /\.eq\("portal_code", siteConfig\.portalCode\)/)
assert.match(checkoutRoute, /metadata\[portalCode\]": siteConfig\.portalCode/)
assert.match(checkoutRoute, /process\.env\.NODE_ENV === "production"[\s\S]*status: 503/)
assert.match(checkoutRoute, /isLiveStripeSecretForSite\(process\.env\.STRIPE_SECRET_KEY, siteConfig\.url\)/)
assert.match(checkoutRoute, /stripeResponse\.json\(\)\.catch\(\(\) => null\)/)
assert.match(checkoutRoute, /Stripe nevrátil platobný odkaz/)
