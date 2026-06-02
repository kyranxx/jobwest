type Env = Record<string, string | undefined>

export type PublicMarketingIntegrations = {
  tagManagerId: string | null
  gaMeasurementId: string | null
  clarityProjectId: string | null
  googleAdsId: string | null
  metaPixelId: string | null
  linkedInPartnerId: string | null
}

export type SiteVerificationMetadata = {
  google?: string
  other?: Record<string, string>
}

function readEnvValue(env: Env, key: string) {
  const value = env[key]?.trim()

  return value ? value : null
}

export function getPublicMarketingIntegrations(env: Env = process.env): PublicMarketingIntegrations {
  return {
    tagManagerId: readEnvValue(env, "NEXT_PUBLIC_GTM_ID"),
    gaMeasurementId: readEnvValue(env, "NEXT_PUBLIC_GA_MEASUREMENT_ID"),
    clarityProjectId: readEnvValue(env, "NEXT_PUBLIC_MICROSOFT_CLARITY_ID"),
    googleAdsId: readEnvValue(env, "NEXT_PUBLIC_GOOGLE_ADS_ID"),
    metaPixelId: readEnvValue(env, "NEXT_PUBLIC_META_PIXEL_ID"),
    linkedInPartnerId: readEnvValue(env, "NEXT_PUBLIC_LINKEDIN_PARTNER_ID"),
  }
}

export function hasAnalyticsIntegrations(integrations: PublicMarketingIntegrations) {
  return Boolean(integrations.tagManagerId || integrations.gaMeasurementId || integrations.clarityProjectId)
}

export function hasMarketingIntegrations(integrations: PublicMarketingIntegrations) {
  return Boolean(
    integrations.tagManagerId ||
      integrations.googleAdsId ||
      integrations.metaPixelId ||
      integrations.linkedInPartnerId,
  )
}

export function getSiteVerificationMetadata(env: Env = process.env): SiteVerificationMetadata | undefined {
  const google = readEnvValue(env, "NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION")
  const ahrefs = readEnvValue(env, "NEXT_PUBLIC_AHREFS_SITE_VERIFICATION")
  const bing = readEnvValue(env, "NEXT_PUBLIC_BING_SITE_VERIFICATION")
  const other: Record<string, string> = {}

  if (ahrefs) {
    other["ahrefs-site-verification"] = ahrefs
  }

  if (bing) {
    other["msvalidate.01"] = bing
  }

  if (!google && Object.keys(other).length === 0) {
    return undefined
  }

  return {
    ...(google ? { google } : {}),
    ...(Object.keys(other).length > 0 ? { other } : {}),
  }
}

export function getIndexNowKey(env: Env = process.env) {
  return readEnvValue(env, "INDEXNOW_KEY")
}

export function isIndexNowKeyPath(pathSegment: string, key: string | null) {
  if (!key) return false

  return pathSegment === `${key}.txt`
}
