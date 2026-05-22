import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const route = readFileSync("app/api/check-email/route.ts", "utf8")

assert.match(route, /NODE_ENV === "production"/)
assert.match(route, /exists: false, checked: false/)
assert.match(route, /production email checks must not enumerate accounts/i)

