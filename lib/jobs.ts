import { countries } from "@/lib/countries"
import type { HighlightTier, Job } from "@/lib/types"
import type { Tables } from "@/lib/database.types"

type JobRow = Tables<"jobs">

export type JobFilters = {
  searchTerm: string
  selectedCategories: string[]
  selectedCountries: string[]
  selectedJobTypes: string[]
  accommodationNotProvided: boolean
}

function normalizeHighlightTier(value: string | null | undefined): HighlightTier {
  return value === "exclusive" || value === "top" ? value : "standard"
}

function getJobRank(job: Pick<Job, "highlightTier" | "isTop">): number {
  const tier = normalizeHighlightTier(job.highlightTier)
  if (tier === "exclusive") return 2
  if (tier === "top" || job.isTop) return 1
  return 0
}

export function mapJobRowToJob(row: JobRow): Job {
  const country = countries.find((item) => item.code === row.country_code)
  const createdAt = row.created_at ?? new Date().toISOString()

  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    location: row.location ?? country?.name ?? "",
    company: row.company ?? "JobWest",
    company_logo: "",
    created_at: createdAt,
    salary_range: row.salary,
    tags: [],
    applications: 0,
    country_code: row.country_code,
    country,
    category: row.category,
    jobType: row.job_type,
    salary: row.salary,
    isTop: row.is_top,
    highlightTier: normalizeHighlightTier(row.highlight_tier),
    topped_at: row.topped_at,
    accommodation_provided: !!row.accommodation_provided,
    accommodation_paid: !!row.accommodation_paid,
  }
}

export function sortJobsByHighlight(jobs: Job[]): Job[] {
  return [...jobs].sort((a, b) => {
    const rankDiff = getJobRank(b) - getJobRank(a)
    if (rankDiff !== 0) return rankDiff

    if (getJobRank(a) > 0 && getJobRank(b) > 0) {
      return new Date(b.topped_at ?? b.created_at).getTime() - new Date(a.topped_at ?? a.created_at).getTime()
    }

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
}

export function filterJobs(jobs: Job[], filters: JobFilters): Job[] {
  const query = filters.searchTerm.trim().toLowerCase()

  return sortJobsByHighlight(jobs).filter((job) => {
    const searchMatch =
      !query ||
      [
        job.title,
        job.company,
        job.description,
        job.location,
        job.category,
        job.country?.name,
        job.jobType,
        job.salary,
        ...(job.tags ?? []),
      ]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(query))

    const categoryMatch = filters.selectedCategories.length === 0 || filters.selectedCategories.includes(job.category)
    const countryMatch = filters.selectedCountries.length === 0 || filters.selectedCountries.includes(job.country_code)
    const jobTypeMatch = filters.selectedJobTypes.length === 0 || filters.selectedJobTypes.includes(job.jobType)
    const accommodationMatch =
      !filters.accommodationNotProvided || (!job.accommodation_provided && !job.accommodation_paid)

    return searchMatch && categoryMatch && countryMatch && jobTypeMatch && accommodationMatch
  })
}
