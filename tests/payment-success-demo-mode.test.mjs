import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const successPage = readFileSync("app/platba/uspesna/page.tsx", "utf8")
const checkoutRoute = readFileSync("app/api/stripe/checkout/route.ts", "utf8")

assert.match(successPage, /process\.env\.NODE_ENV !== "production"/)
assert.doesNotMatch(successPage, /const isDemo = params\.demo === "1"/)
assert.match(checkoutRoute, /session_id=\{CHECKOUT_SESSION_ID\}/)
assert.match(successPage, /session_id\?: string/)
assert.match(successPage, /\.from\("payments"\)/)
assert.match(successPage, /\.eq\("stripe_session_id", sessionId\)/)
assert.match(successPage, /\.eq\("status", "completed"\)/)
assert.match(successPage, /\.eq\("portal_code", siteConfig\.portalCode\)/)
assert.match(successPage, /\.eq\("user_id", user\.id\)/)
assert.match(successPage, /Platbu overujeme/)
