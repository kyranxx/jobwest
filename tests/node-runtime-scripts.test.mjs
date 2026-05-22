import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const packageJson = JSON.parse(readFileSync("package.json", "utf8"))
const nodeRunner = readFileSync("scripts/run-with-node22.mjs", "utf8")
const buildRunner = readFileSync("scripts/build-production.mjs", "utf8")

assert.equal(packageJson.engines.node, "22.x")
assert.equal(packageJson.scripts.build, "node scripts/run-with-node22.mjs scripts/build-production.mjs")
assert.equal(packageJson.scripts["test:unit"], "node scripts/run-with-node22.mjs scripts/run-unit-tests.mjs")
assert.equal(packageJson.scripts.e2e, "node scripts/run-with-node22.mjs scripts/run-e2e.mjs")
assert.equal(packageJson.scripts["jobs:import"], "node scripts/run-with-node22.mjs scripts/import-real-jobs.mjs")
assert.equal(packageJson.scripts["verify:deploy"], "node scripts/run-with-node22.mjs scripts/verify-production-readiness.mjs --mode=deploy")
assert.equal(packageJson.scripts["verify:production"], "node scripts/run-with-node22.mjs scripts/verify-production-readiness.mjs")
assert.match(nodeRunner, /nodeMajor === 22/)
assert.match(nodeRunner, /node@22/)
assert.match(nodeRunner, /findCachedNode22/)
assert.match(nodeRunner, /shell: !cachedNode22 && process\.platform === "win32"/)
assert.match(buildRunner, /guard-production-build\.mjs/)
assert.match(buildRunner, /const nextDistDir = "\.next"/)
assert.match(buildRunner, /rmSync\(nextDistDir, \{ recursive: true, force: true \}\)/)
assert.match(buildRunner, /typeCacheFiles/)
assert.match(buildRunner, /rmSync\(cacheFile, \{ force: true \}\)/)
assert.match(buildRunner, /next.*build/s)
