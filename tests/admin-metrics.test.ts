import assert from "node:assert/strict"
import { getAdminMetrics, type AdminJobRow, type AdminPaymentRow, type AdminUserRow } from "@/lib/admin-metrics"

const jobs: AdminJobRow[] = [
  {
    id: 1,
    title: "Zvárač",
    company: "Agency SK",
    country_code: "de",
    created_at: "2026-05-10T10:00:00.000Z",
    highlight_tier: "top",
    is_top: true,
    topped_at: "2026-05-10T10:10:00.000Z",
    user_id: "employer-1",
    portal_code: "sk",
    portal_domain: "jobwest.sk",
  },
  {
    id: 2,
    title: "Opatrovateľ",
    company: "Care BG",
    country_code: "at",
    created_at: "2026-05-12T10:00:00.000Z",
    highlight_tier: "exclusive",
    is_top: false,
    topped_at: "2026-05-12T10:10:00.000Z",
    user_id: "employer-2",
    portal_code: "bg",
    portal_domain: "jobwest.bg",
  },
  {
    id: 3,
    title: "Skladník",
    company: null,
    country_code: "nl",
    created_at: "2026-05-11T10:00:00.000Z",
    highlight_tier: "standard",
    is_top: false,
    topped_at: null,
    user_id: "employer-1",
    portal_code: "sk",
    portal_domain: "jobwest.sk",
  },
]

const payments: AdminPaymentRow[] = [
  {
    id: "payment-1",
    amount_cents: 990,
    currency: "eur",
    created_at: "2026-05-10T11:00:00.000Z",
    job_id: 1,
    portal_code: "sk",
    status: "completed",
    tier: "top",
    user_id: "employer-1",
  },
  {
    id: "payment-2",
    amount_cents: 1990,
    currency: "eur",
    created_at: "2026-05-12T11:00:00.000Z",
    job_id: 2,
    portal_code: "bg",
    status: "completed",
    tier: "exclusive",
    user_id: "employer-2",
  },
  {
    id: "payment-3",
    amount_cents: 1990,
    currency: "eur",
    created_at: "2026-05-13T11:00:00.000Z",
    job_id: 2,
    portal_code: "bg",
    status: "open",
    tier: "exclusive",
    user_id: "employer-2",
  },
  {
    id: "payment-4",
    amount_cents: 990,
    currency: "eur",
    created_at: "2026-05-14T11:00:00.000Z",
    job_id: null,
    portal_code: "hu",
    status: "completed",
    tier: "top",
    user_id: "employer-2",
  },
]

const users: AdminUserRow[] = [
  { id: "owner", email: "owner@jobwest.sk", role: "owner" },
  { id: "admin", email: "admin@jobwest.sk", role: "admin" },
  { id: "employer-1", email: "one@example.com", role: "employer" },
  { id: "employer-2", email: "two@example.com", role: "employer" },
]

const metrics = getAdminMetrics({ jobs, payments, users })

assert.deepEqual(metrics.totals, {
  ads: 3,
  standardAds: 1,
  topAds: 1,
  exclusiveAds: 1,
  employers: 2,
  payments: 4,
  completedPayments: 3,
  earningsCents: 3970,
})

assert.deepEqual(metrics.portals, [
  {
    code: "sk",
    domain: "jobwest.sk",
    ads: 2,
    topAds: 1,
    exclusiveAds: 0,
    payments: 1,
    earningsCents: 990,
  },
  {
    code: "bg",
    domain: "jobwest.bg",
    ads: 1,
    topAds: 0,
    exclusiveAds: 1,
    payments: 1,
    earningsCents: 1990,
  },
  {
    code: "hu",
    domain: "jobwest.hu",
    ads: 0,
    topAds: 0,
    exclusiveAds: 0,
    payments: 1,
    earningsCents: 990,
  },
])

assert.deepEqual(metrics.portalCountries, [
  {
    portalCode: "bg",
    portalDomain: "jobwest.bg",
    countryCode: "at",
    countryName: "Rakúsko",
    ads: 1,
    topAds: 0,
    exclusiveAds: 1,
    payments: 1,
    earningsCents: 1990,
  },
  {
    portalCode: "sk",
    portalDomain: "jobwest.sk",
    countryCode: "de",
    countryName: "Nemecko",
    ads: 1,
    topAds: 1,
    exclusiveAds: 0,
    payments: 1,
    earningsCents: 990,
  },
  {
    portalCode: "sk",
    portalDomain: "jobwest.sk",
    countryCode: "nl",
    countryName: "Holandsko",
    ads: 1,
    topAds: 0,
    exclusiveAds: 0,
    payments: 0,
    earningsCents: 0,
  },
])

assert.equal(metrics.countries[0]?.code, "de")
assert.equal(metrics.recentPayments[0]?.id, "payment-4")
assert.equal(metrics.recentPayments[1]?.id, "payment-3")
assert.equal(metrics.recentPayments[2]?.tier, "Exclusive 19,90 EUR")
assert.equal(metrics.recentJobs[0]?.id, 2)
assert.equal(metrics.recentJobs[1]?.company, "Neznámy zadávateľ")
