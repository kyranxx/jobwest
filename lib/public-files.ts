import { siteConfig } from "@/lib/site"

type PublicSiteConfig = {
  contactEmail: string
  locale: string
  name: string
  url: string
}

function getSiteUrl(config: PublicSiteConfig) {
  return config.url.replace(/\/+$/, "")
}

export function buildLlmsTxt(config: PublicSiteConfig = siteConfig) {
  const siteUrl = getSiteUrl(config)

  return `# ${config.name}

> ${config.name} is a job portal for work abroad.

Candidates can browse public job listings by country and open each job detail page for salary, location, accommodation, and employer contact information. Employers can manage listings through private account pages.

## Public pages

- [Homepage](${siteUrl}/): Main job discovery page.
- [Job listings](${siteUrl}/ponuky): Current public job listings.
- [Countries](${siteUrl}/krajiny): Job listings grouped by destination country.
- [Terms](${siteUrl}/obchodne-podmienky): Service terms.
- [Privacy policy](${siteUrl}/ochrana-sukromia): Privacy, cookie, and analytics information.

## Machine-readable resources

- [Sitemap](${siteUrl}/sitemap.xml): Canonical public URL index.
- [Robots](${siteUrl}/robots.txt): Crawler rules.
- [Security contact](${siteUrl}/.well-known/security.txt): Responsible disclosure contact.
`
}

export function buildSecurityTxt(config: PublicSiteConfig = siteConfig, expires = getDefaultExpiry()) {
  const siteUrl = getSiteUrl(config)
  const language = config.locale.split("-")[0]

  return `Contact: mailto:${config.contactEmail}
Expires: ${expires.toISOString()}
Canonical: ${siteUrl}/.well-known/security.txt
Policy: ${siteUrl}/ochrana-sukromia
Preferred-Languages: ${language}, en
`
}

function getDefaultExpiry() {
  const expiry = new Date()
  expiry.setFullYear(expiry.getFullYear() + 1)
  return expiry
}
