import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const jobSource = readFileSync("lib/job-source.ts", "utf8")

assert.match(jobSource, /import \{ siteConfig \} from "@\/lib\/site"/)
assert.match(jobSource, /const endpoint = new URL/)
assert.match(jobSource, /\/rest\/v1\/jobs/)
assert.match(jobSource, /endpoint\.searchParams\.set\("select", "\*"\)/)
assert.match(jobSource, /endpoint\.searchParams\.set\("portal_code", `eq\.\$\{siteConfig\.portalCode\}`\)/)
assert.match(jobSource, /fetch\(endpoint\.toString\(\)/)
