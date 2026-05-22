import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"

assert.equal(existsSync("app/ucet/inzerat/[id]/upravit/page.tsx"), true)

const editAd = readFileSync("components/dashboard/edit-ad.tsx", "utf8")
const addAd = readFileSync("components/dashboard/add-ad.tsx", "utf8")

assert.match(addAd, /jobAdFormSchema/)
assert.match(editAd, /jobAdFormSchema/)
assert.match(editAd, /\.eq\("user_id", user\.id\)/)
assert.match(editAd, /\.eq\("portal_code", siteConfig\.portalCode\)/)
assert.match(editAd, /\.select\("id"\)\s*\.maybeSingle\(\)/)
assert.match(editAd, /Uložiť zmeny/)
