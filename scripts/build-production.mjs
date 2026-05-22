import { spawnSync } from "node:child_process"
import { rmSync } from "node:fs"
import { fileURLToPath } from "node:url"

const guardScript = fileURLToPath(new URL("./guard-production-build.mjs", import.meta.url))
const nextBin = fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url))
const nextDistDir = ".next"
const typeCacheFiles = [".tsbuildinfo", "tsconfig.tsbuildinfo"]

function run(args) {
  const result = spawnSync(process.execPath, args, {
    stdio: "inherit",
    env: process.env,
  })

  return result.status ?? 1
}

const guardExitCode = run([guardScript])

if (guardExitCode !== 0) {
  process.exit(guardExitCode)
}

rmSync(nextDistDir, { recursive: true, force: true })

for (const cacheFile of typeCacheFiles) {
  rmSync(cacheFile, { force: true })
}

process.exit(run([nextBin, "build"]))
