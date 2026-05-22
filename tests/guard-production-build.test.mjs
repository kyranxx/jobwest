import assert from "node:assert/strict"
import { shouldRunProductionGate, productionGateArgs } from "../scripts/guard-production-build-helpers.mjs"

assert.equal(shouldRunProductionGate({ VERCEL_ENV: "preview" }), false)
assert.equal(shouldRunProductionGate({ VERCEL_ENV: "development" }), false)
assert.equal(shouldRunProductionGate({}), false)
assert.equal(shouldRunProductionGate({ VERCEL_ENV: "production" }), true)

assert.deepEqual(productionGateArgs, [
  "scripts/verify-production-readiness.mjs",
  "--mode=deploy",
  "--skip-vercel",
])
