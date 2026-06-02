import { demoJobs } from "@/lib/demo-jobs"
import { isPublishableJob, isPublishableRealJob, mapJobRowToJob, getJobSlug } from "@/lib/jobs"
import type { Job } from "@/lib/types"
import type { Tables } from "@/lib/database.types"
import { getSupabasePublicConfig } from "@/lib/utils/supabase/env"
import { siteConfig } from "@/lib/site"
import { unstable_cache } from "next/cache"

const JOB_SOURCE_TIMEOUT_MS = 2500

const getCachedVisibleJobs = unstable_cache(async (): Promise<{ jobs: Job[]; isDemoMode: boolean }> => {
  const jobs = await fetchVisibleJobs()

  if (jobs.length) {
    return { jobs, isDemoMode: false }
  }

  if (canUseDemoJobs()) {
    const fallbackJobs = demoJobs.filter(isPublishableJob)
    return { jobs: fallbackJobs, isDemoMode: true }
  }

  return { jobs: [], isDemoMode: false }
}, ["jobwest-visible-jobs"], { revalidate: 300, tags: ["jobs"] })

function canUseDemoJobs() {
  if (process.env.VERCEL_ENV === "production") {
    return false
  }

  if (process.env.NODE_ENV !== "production") {
    return true
  }

  return process.env.JOBWEST_ALLOW_DEMO_JOBS === "1"
}

async function fetchVisibleJobs(): Promise<Job[]> {
  const { url, anonKey } = getSupabasePublicConfig()
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), JOB_SOURCE_TIMEOUT_MS)

  try {
    const endpoint = new URL(`${url.replace(/\/$/, "")}/rest/v1/jobs`)
    endpoint.searchParams.set("select", "*")
    endpoint.searchParams.set("portal_code", `eq.${siteConfig.portalCode}`)

    const response = await fetch(endpoint.toString(), {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        Accept: "application/json",
      },
      signal: controller.signal,
      next: { revalidate: 300, tags: ["jobs"] },
    })

    if (!response.ok) return []

    const rows = (await response.json()) as Tables<"jobs">[]

    return rows.map(mapJobRowToJob).filter(isPublishableRealJob)
  } catch {
    return []
  } finally {
    clearTimeout(timeout)
  }
}

export async function getVisibleJobs(): Promise<{ jobs: Job[]; isDemoMode: boolean }> {
  return getCachedVisibleJobs()
}

export async function getVisibleJobBySlug(slug: string): Promise<{ job: Job; isDemoMode: boolean } | null> {
  const { jobs, isDemoMode } = await getVisibleJobs()
  const job = jobs.find((job) => getJobSlug(job) === slug || String(job.id).toLowerCase() === slug.toLowerCase())

  return job ? { job, isDemoMode } : null
}
