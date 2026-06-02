import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const useJobs = readFileSync("hooks/use-jobs.tsx", "utf8")
const myAdsList = readFileSync("components/dashboard/my-ads-list.tsx", "utf8")
const addAd = readFileSync("components/dashboard/add-ad.tsx", "utf8")
const mainDashboard = readFileSync("components/dashboard/main-dashboard.tsx", "utf8")

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
assert.match(addAd, /accommodation_included: values\.accommodation_included/)

assert.match(mainDashboard, /import \{ siteConfig \} from "@\/lib\/site"/)
assert.match(mainDashboard, /\.eq\("user_id", currentUser\.id\)\s*\.eq\("portal_code", siteConfig\.portalCode\)/)
