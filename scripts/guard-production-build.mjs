import { spawnSync } from "node:child_process"
import { productionGateArgs, shouldRunProductionGate } from "./guard-production-build-helpers.mjs"

if (!shouldRunProductionGate(process.env)) {
  process.exit(0)
}

console.log("Running JobWest production deploy readiness gate...")

const result = spawnSync(process.execPath, productionGateArgs, {
  stdio: "inherit",
  env: process.env,
})

process.exit(result.status ?? 1)
