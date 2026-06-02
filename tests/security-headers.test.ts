import assert from "node:assert/strict"
import { getSecurityHeaders } from "@/lib/security-headers"

assert.deepEqual(getSecurityHeaders(), {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  Link: '</llms.txt>; rel="alternate"; type="text/plain", </sitemap.xml>; rel="sitemap"; type="application/xml"',
})
