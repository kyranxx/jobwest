import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const jobSource = readFileSync("lib/job-source.ts", "utf8")
const e2eRunner = readFileSync("scripts/run-e2e.mjs", "utf8")

assert.match(jobSource, /function canUseDemoJobs\(\)/)
assert.match(jobSource, /process\.env\.VERCEL_ENV === "production"[\s\S]*return false/)
assert.match(jobSource, /process\.env\.JOBWEST_ALLOW_DEMO_JOBS === "1"/)
assert.match(jobSource, /canUseDemoJobs\(\)[\s\S]*fallbackJobs/)
assert.match(jobSource, /return \{ jobs: \[\], isDemoMode: false \}/)
assert.match(e2eRunner, /JOBWEST_ALLOW_DEMO_JOBS: "1"/)
assert.match(e2eRunner, /VERCEL_ENV: "preview"/)
