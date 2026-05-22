import type { MetadataRoute } from "next"
import { siteConfig } from "@/lib/site"

const siteUrl = siteConfig.url

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/auth/", "/admin", "/admin/", "/ucet", "/ucet/", "/platba/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
