import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const runner = readFileSync("scripts/run-e2e.mjs", "utf8")

assert.match(runner, /const nextDistDir = "\.next"/)
assert.match(runner, /const typeCacheFiles = \["\.tsbuildinfo", "tsconfig\.tsbuildinfo"\]/)
assert.match(runner, /await rm\(nextDistDir, \{ recursive: true, force: true \}\)/)
assert.match(runner, /Promise\.all\(typeCacheFiles\.map/)
