import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import {
  getIndexNowKey,
  getPublicMarketingIntegrations,
  getSiteVerificationMetadata,
  hasAnalyticsIntegrations,
  hasMarketingIntegrations,
  isIndexNowKeyPath,
} from "@/lib/marketing-integrations"

const env = {
  NEXT_PUBLIC_GTM_ID: " GTM-ABC1234 ",
  NEXT_PUBLIC_GA_MEASUREMENT_ID: " G-ABC1234567 ",
  NEXT_PUBLIC_MICROSOFT_CLARITY_ID: " clarity-project ",
  NEXT_PUBLIC_GOOGLE_ADS_ID: " AW-123456789 ",
  NEXT_PUBLIC_META_PIXEL_ID: " 1234567890 ",
  NEXT_PUBLIC_LINKEDIN_PARTNER_ID: " 7654321 ",
  NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION: " google-token ",
  NEXT_PUBLIC_BING_SITE_VERIFICATION: " bing-token ",
  NEXT_PUBLIC_AHREFS_SITE_VERIFICATION: " ahrefs-token ",
  INDEXNOW_KEY: " indexnow-token ",
}

const integrations = getPublicMarketingIntegrations(env)

assert.deepEqual(integrations, {
  tagManagerId: "GTM-ABC1234",
  gaMeasurementId: "G-ABC1234567",
  clarityProjectId: "clarity-project",
  googleAdsId: "AW-123456789",
  metaPixelId: "1234567890",
  linkedInPartnerId: "7654321",
})

assert.equal(hasAnalyticsIntegrations(integrations), true)
assert.equal(hasMarketingIntegrations(integrations), true)

assert.deepEqual(getSiteVerificationMetadata(env), {
  google: "google-token",
  other: {
    "ahrefs-site-verification": "ahrefs-token",
    "msvalidate.01": "bing-token",
  },
})

assert.equal(getIndexNowKey(env), "indexnow-token")
assert.equal(isIndexNowKeyPath("indexnow-token.txt", "indexnow-token"), true)
assert.equal(isIndexNowKeyPath("wrong.txt", "indexnow-token"), false)
assert.equal(isIndexNowKeyPath("indexnow-token.txt", null), false)

const emptyIntegrations = getPublicMarketingIntegrations({})

assert.equal(hasAnalyticsIntegrations(emptyIntegrations), false)
assert.equal(hasMarketingIntegrations(emptyIntegrations), false)
assert.equal(getSiteVerificationMetadata({}), undefined)
assert.equal(getIndexNowKey({}), null)

const consentComponent = readFileSync("components/marketing/marketing-consent.tsx", "utf8")

assert.match(consentComponent, /id="cookie-consent-analytics"/)
assert.match(consentComponent, /id="cookie-consent-marketing"/)
