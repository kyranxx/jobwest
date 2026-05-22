import type { MetadataRoute } from "next"
import { countries, getCountryPath } from "@/lib/countries"
import { getVisibleJobs } from "@/lib/job-source"
import { getJobPath } from "@/lib/jobs"
import { siteConfig } from "@/lib/site"

const siteUrl = siteConfig.url
const staticUrls = [
  { path: "/ponuky", changeFrequency: "daily" as const, priority: 0.9 },
  { path: "/krajiny", changeFrequency: "daily" as const, priority: 0.8 },
  { path: "/obchodne-podmienky", changeFrequency: "monthly" as const, priority: 0.4 },
  { path: "/ochrana-sukromia", changeFrequency: "monthly" as const, priority: 0.4 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const { jobs, isDemoMode } = await getVisibleJobs()
  const activeCountryCodes = new Set(jobs.map((job) => job.country_code))
  const realJobs = isDemoMode ? [] : jobs

  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    ...staticUrls.map((entry) => ({
      url: `${siteUrl}${entry.path}`,
      lastModified: now,
      changeFrequency: entry.changeFrequency,
      priority: entry.priority,
    })),
    ...countries.filter((country) => !isDemoMode && activeCountryCodes.has(country.code)).map((country) => ({
      url: `${siteUrl}${getCountryPath(country.code)}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...realJobs.slice(0, 500).map((job) => ({
      url: `${siteUrl}${getJobPath(job)}`,
      lastModified: new Date(job.created_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ]
}
