import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const useJobs = readFileSync("hooks/use-jobs.tsx", "utf8")
const myAdsList = readFileSync("components/dashboard/my-ads-list.tsx", "utf8")
const addAd = readFileSync("components/dashboard/add-ad.tsx", "utf8")

assert.match(useJobs, /import \{ siteConfig \} from "@\/lib\/site"/)
assert.match(useJobs, /\.eq\('user_id', user\.id\)/)
assert.match(useJobs, /\.eq\('portal_code', siteConfig\.portalCode\)/)

assert.match(myAdsList, /import \{ siteConfig \} from "@\/lib\/site"/)
assert.match(myAdsList, /\.eq\("id", Number\(selectedJob\.id\)\)/)
assert.match(myAdsList, /\.eq\("user_id", user\.id\)/)
assert.match(myAdsList, /\.eq\("portal_code", siteConfig\.portalCode\)/)
assert.match(myAdsList, /\.select\("id"\)\s*\.maybeSingle\(\)/)
assert.match(myAdsList, /if \(deleteError \|\| !deletedJob\)/)

assert.match(addAd, /portal_code: siteConfig\.portalCode/)
assert.match(addAd, /portal_domain: siteConfig\.portalDomain/)
