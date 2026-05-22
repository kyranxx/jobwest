import portals from "./portal-registry.json"

export type PortalConfig = {
  code: string
  countryName: string
  domain: string
  locale: string
  name: string
}

const portalData = portals as PortalConfig[] | { default: PortalConfig[] }

export const portalConfigs = Array.isArray(portalData) ? portalData : portalData.default
export const defaultPortalConfig = portalConfigs.find((portal) => portal.code === "sk") ?? portalConfigs[0]

export function getPortalConfig(code: string | null | undefined) {
  return portalConfigs.find((portal) => portal.code === code) ?? null
}

export function getPortalDomain(code: string | null | undefined, fallback = "") {
  return getPortalConfig(code)?.domain ?? fallback
}
