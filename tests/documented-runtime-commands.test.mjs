import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const readme = readFileSync("README.md", "utf8")
const cutover = readFileSync("docs/production-cutover.md", "utf8")
const importer = readFileSync("scripts/import-real-jobs.mjs", "utf8")

assert.doesNotMatch(readme, /node scripts\/verify-production-readiness\.mjs/)
assert.doesNotMatch(cutover, /node scripts\/verify-production-readiness\.mjs/)
assert.match(cutover, /pnpm verify:deploy -- --skip-vercel/)
assert.doesNotMatch(importer, /Usage: node scripts\/import-real-jobs\.mjs/)
assert.match(importer, /Usage: pnpm jobs:import/)

