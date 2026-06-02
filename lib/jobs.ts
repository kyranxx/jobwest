import { countries } from "@/lib/countries"
import type { HighlightTier, Job, SalaryBasis } from "@/lib/types"
import type { Tables } from "@/lib/database.types"
import { jobTypes, languageOptions } from "@/lib/job-options"

type JobRow = Tables<"jobs">

export type JobFilters = {
  searchTerm: string
  selectedCategories: string[]
  selectedCountries: string[]
  selectedJobTypes: string[]
  selectedLanguages: string[]
  selectedHighlightTiers: HighlightTier[]
  accommodationProvided: boolean
  minSalary: string
  salaryCurrency: string
}

export type ParsedSalary = {
  min: number
  max: number
  currency: string
  unitText: "HOUR" | "MONTH"
  basis: SalaryBasis
}

export type TrustBadge = {
  id: string
  label: string
  tone: "emerald" | "teal" | "amber" | "slate"
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

export function parseSalary(value: string, basis: SalaryBasis = "unspecified"): ParsedSalary | null {
  const currency = value.match(/\b(EUR|CHF|GBP)\b/i)?.[1]?.toUpperCase()
  const numbers = [...value.matchAll(/\d[\d\s]*(?:[,.]\d+)?/g)]
    .map((match) => Number(match[0].replace(/\s/g, "").replace(",", ".")))
    .filter((number) => Number.isFinite(number))

  if (!currency || numbers.length === 0) return null

  const unitText = /\/h|\bhod|hodina|hour/i.test(value) ? "HOUR" : "MONTH"
  const min = numbers.length >= 2 ? Math.min(numbers[0], numbers[1]) : numbers[0]
  const max = numbers.length >= 2 ? Math.max(numbers[0], numbers[1]) : numbers[0]

  return { min, max, currency, unitText, basis }
}

export function formatSalaryUnit(unitText: ParsedSalary["unitText"]): string {
  return unitText === "HOUR" ? "hodinovo" : "mesačne"
}

export function formatSalaryBasis(basis: SalaryBasis = "unspecified"): string {
  if (basis === "gross") return "brutto"
  if (basis === "net") return "netto"
  return "netto/brutto nešpec."
}

function slugify(value: string): string {
  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return slug || "ponuka"
}

export function getJobSlug(job: Pick<Job, "id" | "title">): string {
  return `${String(job.id).toLowerCase()}-${slugify(job.title)}`
}

export function getJobPath(job: Pick<Job, "id" | "title">): string {
  return `/ponuky/${getJobSlug(job)}`
}

const languageMatchers: Record<string, RegExp> = {
  nemcina: /\b(nem[cč]ina|nemeck[yý]|deutsch|german)\b/i,
  anglictina: /\b(angli[cč]tina|anglick[yý]|english|b2)\b/i,
  slovencina: /\b(sloven[cč]ina|slovensk[yý]|slovak)\b/i,
  holandcina: /\b(holand[cč]ina|holandsk[yý]|dutch)\b/i,
  francuzstina: /\b(franc[uú]z[sš]tina|franc[uú]zsk[yý]|french)\b/i,
  taliancina: /\b(talian[cč]ina|taliansk[yý]|italian)\b/i,
}

export function getJobLanguages(job: Pick<Job, "description" | "tags" | "languageRequirements">): string[] {
  const explicitLanguages = job.languageRequirements ?? []
  const haystack = [job.description, ...(job.tags ?? [])].join(" ")
  const inferredLanguages = languageOptions
    .filter((language) => languageMatchers[language.id]?.test(haystack))
    .map((language) => language.id)

  return [...new Set([...explicitLanguages, ...inferredLanguages])]
}

export function getJobTrustBadges(job: Job): TrustBadge[] {
  const badges: TrustBadge[] = [
    { id: "no-fees", label: "Bez poplatkov", tone: "emerald" },
  ]

  if (job.contactInfo || job.companyName) {
    badges.push({ id: "contact", label: "Kontakt v detaile", tone: "slate" })
  }

  if (job.accommodation_paid) {
    badges.push({ id: "housing-paid", label: "Ubytovanie hradené", tone: "emerald" })
  } else if (job.accommodation_provided) {
    badges.push({ id: "housing", label: "Ubytovanie zabezpečené", tone: "teal" })
  }

  const tier = normalizeHighlightTier(job.highlightTier)
  if (tier === "exclusive") {
    badges.push({ id: "exclusive", label: "Exclusive ponuka", tone: "amber" })
  } else if (tier === "top" || job.isTop) {
    badges.push({ id: "top", label: "TOP ponuka", tone: "amber" })
  }

  return badges
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
    salaryBasis: "unspecified",
    languageRequirements: [],
    isTop: row.is_top,
    highlightTier: normalizeHighlightTier(row.highlight_tier),
    topped_at: row.topped_at,
    accommodation_provided: !!row.accommodation_provided,
    accommodation_paid: !!row.accommodation_paid,
    companyName: row.company ?? undefined,
    contactInfo: row.contact_info ?? undefined,
  }
}

const placeholderValues = new Set([
  "aaa",
  "asdf",
  "bla bla",
  "blabla",
  "demo",
  "placeholder",
  "qwerty",
  "sample",
  "test",
  "testing",
  "xxx",
])

function normalizeText(value: string | null | undefined): string {
  return (value ?? "").trim().replace(/\s+/g, " ").toLowerCase()
}

function isPlaceholderText(value: string | null | undefined): boolean {
  const text = normalizeText(value)

  if (!text) return false
  if (placeholderValues.has(text)) return true

  return /^(test|demo)\s*(job|ponuka|inzerat|inzerát)?\s*\d*$/i.test(text)
}

export function isPublishableJob(job: Pick<Job, "title" | "company" | "description">): boolean {
  const title = normalizeText(job.title)
  const company = normalizeText(job.company)
  const description = normalizeText(job.description)

  if (title.length < 3) return false
  if (isPlaceholderText(title) || isPlaceholderText(company)) return false
  if (description.includes("lorem ipsum")) return false

  return true
}

export function isPublishableRealJob(
  job: Pick<Job, "title" | "company" | "description" | "contactInfo">,
): boolean {
  if (!isPublishableJob(job)) return false

  const contactInfo = normalizeText(job.contactInfo)
  if (!contactInfo) return false

  return !hasPlaceholderContactDomain(contactInfo) && !hasPlaceholderPhoneNumber(contactInfo)
}

function hasPlaceholderContactDomain(value: string) {
  return /\bexample\.(com|org|net|invalid)\b|\.example\b/i.test(value)
}

function hasPlaceholderPhoneNumber(value: string) {
  return /\+\d{1,3}(?:[\s()-]*0){6,}\b/.test(value)
}

export function formatJobType(value: string): string {
  return jobTypes.find((type) => type.id === value)?.label ?? value
}

function sortJobsByHighlight(jobs: Job[]): Job[] {
  return jobs.toSorted((a, b) => {
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
  const minSalary = Number(filters.minSalary)
  const hasMinSalary = Number.isFinite(minSalary) && minSalary > 0

  return sortJobsByHighlight(jobs).filter((job) => {
    const jobLanguages = getJobLanguages(job)
    const parsedSalary = parseSalary(job.salary, job.salaryBasis)
    const tier = normalizeHighlightTier(job.highlightTier)
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
    const languageMatch =
      filters.selectedLanguages.length === 0 ||
      filters.selectedLanguages.some((language) => jobLanguages.includes(language))
    const highlightMatch =
      filters.selectedHighlightTiers.length === 0 ||
      filters.selectedHighlightTiers.includes(tier) ||
      (filters.selectedHighlightTiers.includes("top") && job.isTop)
    const accommodationMatch =
      !filters.accommodationProvided || job.accommodation_provided || job.accommodation_paid
    const salaryCurrencyMatch =
      filters.salaryCurrency === "any" || (!!parsedSalary && parsedSalary.currency === filters.salaryCurrency)
    const salaryMatch = !hasMinSalary || (!!parsedSalary && parsedSalary.max >= minSalary)

    return (
      searchMatch &&
      categoryMatch &&
      countryMatch &&
      jobTypeMatch &&
      languageMatch &&
      highlightMatch &&
      accommodationMatch &&
      salaryCurrencyMatch &&
      salaryMatch
    )
  })
}
