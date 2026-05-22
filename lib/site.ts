import { defaultPortalConfig, getPortalConfig } from "./portals"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${defaultPortalConfig.domain}`
const portalCode = process.env.NEXT_PUBLIC_PORTAL_CODE ?? defaultPortalConfig.code
const portalConfig = getPortalConfig(portalCode) ?? defaultPortalConfig

export const siteConfig = {
  name: "JobWest",
  url: siteUrl,
  portalCode,
  portalDomain: process.env.NEXT_PUBLIC_PORTAL_DOMAIN ?? portalConfig.domain ?? new URL(siteUrl).hostname,
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "info@jobwest.sk",
  locale: portalConfig.locale,
} as const
