import assert from "node:assert/strict"
import { defaultPortalConfig, getPortalConfig, getPortalDomain, portalConfigs } from "../lib/portals"

assert.equal(defaultPortalConfig.code, "sk")

for (const code of ["sk", "ro", "bg", "hu", "ua"]) {
  const portal = getPortalConfig(code)

  assert.ok(portal, `${code} portal is registered`)
  assert.match(portal.domain, /^jobwest\.[a-z]+$/)
  assert.equal(getPortalDomain(code), portal.domain)
}

assert.equal(new Set(portalConfigs.map((portal) => portal.code)).size, portalConfigs.length)
assert.equal(getPortalConfig("xx"), null)
assert.equal(getPortalDomain("xx", "custom.example"), "custom.example")
