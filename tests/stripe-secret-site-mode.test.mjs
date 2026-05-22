import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const payments = readFileSync("lib/payments.ts", "utf8")

assert.match(payments, /export function isLiveStripeSecretForSite/)
assert.match(payments, /hostname === "localhost"/)
assert.match(payments, /hostname === "127\.0\.0\.1"/)
assert.match(payments, /startsWith\("sk_live_"\)/)
