import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const ciWorkflow = readFileSync(".github/workflows/ci.yml", "utf8")

assert.match(ciWorkflow, /pnpm verify:deploy -- --skip-vercel/)
assert.doesNotMatch(ciWorkflow, /node scripts\/verify-production-readiness\.mjs/)

