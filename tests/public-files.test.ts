import assert from "node:assert/strict"
import { buildLlmsTxt, buildSecurityTxt } from "@/lib/public-files"

const portal = {
  name: "JobWest",
  url: "https://jobwest.ro",
  contactEmail: "info@jobwest.ro",
  locale: "ro-RO",
}

const llmsTxt = buildLlmsTxt(portal)

assert.match(llmsTxt, /^# JobWest/)
assert.match(llmsTxt, /> JobWest is a job portal for work abroad\./)
assert.match(llmsTxt, /\[Job listings\]\(https:\/\/jobwest\.ro\/ponuky\)/)
assert.match(llmsTxt, /\[Privacy policy\]\(https:\/\/jobwest\.ro\/ochrana-sukromia\)/)

const securityTxt = buildSecurityTxt(portal, new Date("2027-05-31T00:00:00.000Z"))

assert.match(securityTxt, /^Contact: mailto:info@jobwest\.ro/m)
assert.match(securityTxt, /^Expires: 2027-05-31T00:00:00\.000Z/m)
assert.match(securityTxt, /^Canonical: https:\/\/jobwest\.ro\/\.well-known\/security\.txt/m)
assert.match(securityTxt, /^Policy: https:\/\/jobwest\.ro\/ochrana-sukromia/m)
assert.match(securityTxt, /^Preferred-Languages: ro, en/m)
