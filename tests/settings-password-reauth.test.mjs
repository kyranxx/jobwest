import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const settings = readFileSync("components/dashboard/settings.tsx", "utf8")

assert.match(settings, /currentPassword/)
assert.match(settings, /signInWithPassword\(/)
assert.match(settings, /password:\s*values\.currentPassword/)
assert.match(settings, /password:\s*values\.newPassword/)
assert.ok(
  settings.indexOf("signInWithPassword(") < settings.indexOf("updateUser({"),
  "settings password form must verify the current password before updating it",
)
