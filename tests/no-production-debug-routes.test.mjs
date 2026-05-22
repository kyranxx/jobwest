import assert from "node:assert/strict"
import { existsSync } from "node:fs"

assert.equal(existsSync("app/test-auth/page.tsx"), false, "Remove the /test-auth debug route before production")
