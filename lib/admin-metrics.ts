import { countries } from "@/lib/countries"
import { paymentTiers, type PaymentTier } from "@/lib/payments"
import { siteConfig } from "@/lib/site"
import { getPortalDomain } from "./portals"
import type { Tables } from "@/lib/database.types"

export type AdminJobRow = Pick<
  Tables<"jobs">,
  | "id"
  | "title"
  | "company"
  | "country_code"
  | "created_at"
  | "highlight_tier"
  | "is_top"
  | "topped_at"
  | "user_id"
  | "portal_code"
  | "portal_domain"
>

export type AdminPaymentRow = Pick<
  Tables<"payments">,
  | "id"
  | "amount_cents"
  | "currency"
  | "created_at"
  | "job_id"
  | "portal_code"
  | "status"
  | "tier"
  | "user_id"
>

export type AdminUserRow = Pick<Tables<"users">, "id" | "email" | "role">

export type AdminMetrics = {
  totals: {
    ads: number
    standardAds: number
    topAds: number
    exclusiveAds: number
    employers: number
    payments: number
    completedPayments: number
    earningsCents: number
  }
  portals: PortalMetric[]
  countries: CountryMetric[]
  portalCountries: PortalCountryMetric[]
  recentPayments: PaymentMetric[]
  recentJobs: JobMetric[]
}

export type PortalMetric = {
  code: string
  domain: string
  ads: number
  topAds: number
  exclusiveAds: number
  payments: number
  earningsCents: number
}

export type CountryMetric = {
  code: string
  name: string
  ads: number
  topAds: number
  exclusiveAds: number
}

export type PortalCountryMetric = {
  portalCode: string
  portalDomain: string
  countryCode: string
  countryName: string
  ads: number
  topAds: number
  exclusiveAds: number
  payments: number
  earningsCents: number
}

export type PaymentMetric = {
  id: string
  createdAt: string
  tier: string
  status: string
  amountCents: number
  currency: string
  portalCode: string
  jobId: number | null
}

export type JobMetric = {
  id: number
  title: string
  company: string
  createdAt: string
  countryCode: string
  highlightTier: string
  portalCode: string
}

export function getAdminMetrics({
  jobs,
  payments,
  users,
}: {
  jobs: AdminJobRow[]
  payments: AdminPaymentRow[]
  users: AdminUserRow[]
}): AdminMetrics {
  const completedPayments = payments.filter((payment) => payment.status === "completed")
  const topJobs = jobs.filter((job) => getNormalizedHighlightTier(job) === "top")
  const exclusiveJobs = jobs.filter((job) => getNormalizedHighlightTier(job) === "exclusive")
  const portalMap = new Map<string, PortalMetric>()
  const countryMap = new Map<string, CountryMetric>()
  const portalCountryMap = new Map<string, PortalCountryMetric>()
  const jobsById = new Map(jobs.map((job) => [job.id, job]))

  for (const job of jobs) {
    const portal = getPortalMetric(portalMap, job.portal_code, job.portal_domain)
    const tier = getNormalizedHighlightTier(job)
    portal.ads += 1
    if (tier === "top") portal.topAds += 1
    if (tier === "exclusive") portal.exclusiveAds += 1

    const country = getCountryMetric(countryMap, job.country_code)
    country.ads += 1
    if (tier === "top") country.topAds += 1
    if (tier === "exclusive") country.exclusiveAds += 1

    const portalCountry = getPortalCountryMetric(
      portalCountryMap,
      job.portal_code,
      job.portal_domain,
      job.country_code,
    )
    portalCountry.ads += 1
    if (tier === "top") portalCountry.topAds += 1
    if (tier === "exclusive") portalCountry.exclusiveAds += 1
  }

  for (const payment of completedPayments) {
    const portal = getPortalMetric(portalMap, payment.portal_code, null)
    portal.payments += 1
    portal.earningsCents += payment.amount_cents

    const paidJob = payment.job_id ? jobsById.get(payment.job_id) : null
    if (paidJob) {
      const portalCountry = getPortalCountryMetric(
        portalCountryMap,
        payment.portal_code || paidJob.portal_code,
        paidJob.portal_domain,
        paidJob.country_code,
      )
      portalCountry.payments += 1
      portalCountry.earningsCents += payment.amount_cents
    }
  }

  return {
    totals: {
      ads: jobs.length,
      standardAds: jobs.length - topJobs.length - exclusiveJobs.length,
      topAds: topJobs.length,
      exclusiveAds: exclusiveJobs.length,
      employers: users.filter((user) => user.role !== "admin" && user.role !== "owner").length,
      payments: payments.length,
      completedPayments: completedPayments.length,
      earningsCents: completedPayments.reduce((total, payment) => total + payment.amount_cents, 0),
    },
    portals: [...portalMap.values()].sort((a, b) => b.ads - a.ads || b.earningsCents - a.earningsCents),
    countries: [...countryMap.values()].sort((a, b) => b.ads - a.ads),
    portalCountries: [...portalCountryMap.values()].sort(
      (a, b) =>
        a.portalCode.localeCompare(b.portalCode) ||
        b.ads - a.ads ||
        b.earningsCents - a.earningsCents ||
        a.countryName.localeCompare(b.countryName),
    ),
    recentPayments: payments
      .toSorted((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 8)
      .map((payment) => ({
        id: payment.id,
        createdAt: payment.created_at,
        tier: formatPaymentTier(payment.tier),
        status: payment.status,
        amountCents: payment.amount_cents,
        currency: payment.currency,
        portalCode: payment.portal_code ?? siteConfig.portalCode,
        jobId: payment.job_id,
      })),
    recentJobs: jobs
      .toSorted((a, b) => new Date(b.created_at ?? "").getTime() - new Date(a.created_at ?? "").getTime())
      .slice(0, 8)
      .map((job) => ({
        id: job.id,
        title: job.title,
        company: job.company ?? "Neznámy zadávateľ",
        createdAt: job.created_at ?? "",
        countryCode: job.country_code,
        highlightTier: getNormalizedHighlightTier(job),
        portalCode: job.portal_code ?? siteConfig.portalCode,
      })),
  }
}

function getPortalCountryMetric(
  portalCountryMap: Map<string, PortalCountryMetric>,
  portalCode: string | null,
  portalDomain: string | null,
  countryCode: string,
) {
  const code = portalCode || siteConfig.portalCode
  const key = `${code}:${countryCode}`
  const existing = portalCountryMap.get(key)

  if (existing) {
    if (!existing.portalDomain && portalDomain) existing.portalDomain = portalDomain
    return existing
  }

  const metric = {
    portalCode: code,
    portalDomain: portalDomain || getPortalDomain(code, code === siteConfig.portalCode ? siteConfig.portalDomain : ""),
    countryCode,
    countryName: countries.find((country) => country.code === countryCode)?.name ?? countryCode.toUpperCase(),
    ads: 0,
    topAds: 0,
    exclusiveAds: 0,
    payments: 0,
    earningsCents: 0,
  }

  portalCountryMap.set(key, metric)
  return metric
}

function getPortalMetric(
  portalMap: Map<string, PortalMetric>,
  portalCode: string | null,
  portalDomain: string | null,
) {
  const code = portalCode || siteConfig.portalCode
  const existing = portalMap.get(code)

  if (existing) {
    if (!existing.domain && portalDomain) existing.domain = portalDomain
    return existing
  }

  const metric = {
    code,
    domain: portalDomain || getPortalDomain(code, code === siteConfig.portalCode ? siteConfig.portalDomain : ""),
    ads: 0,
    topAds: 0,
    exclusiveAds: 0,
    payments: 0,
    earningsCents: 0,
  }

  portalMap.set(code, metric)
  return metric
}

function getCountryMetric(countryMap: Map<string, CountryMetric>, countryCode: string) {
  const existing = countryMap.get(countryCode)

  if (existing) return existing

  const metric = {
    code: countryCode,
    name: countries.find((country) => country.code === countryCode)?.name ?? countryCode.toUpperCase(),
    ads: 0,
    topAds: 0,
    exclusiveAds: 0,
  }

  countryMap.set(countryCode, metric)
  return metric
}

function getNormalizedHighlightTier(job: Pick<AdminJobRow, "highlight_tier" | "is_top">) {
  if (job.highlight_tier === "exclusive") return "exclusive"
  if (job.highlight_tier === "top" || job.is_top) return "top"
  return "standard"
}

function formatPaymentTier(value: string) {
  if (value in paymentTiers) {
    return paymentTiers[value as PaymentTier].label
  }

  return value
}
