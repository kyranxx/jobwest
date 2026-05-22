import type { Metadata } from "next"
import type React from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import {
  AlertTriangle,
  BadgeEuro,
  BarChart3,
  BriefcaseBusiness,
  Crown,
  ExternalLink,
  Globe2,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { getAdminMetrics, type AdminJobRow, type AdminPaymentRow, type AdminUserRow } from "@/lib/admin-metrics"
import { siteConfig } from "@/lib/site"
import { getSupabaseServerClient } from "@/lib/utils/supabase/server"
import { getSupabaseServiceClient } from "@/lib/utils/supabase/service"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Admin prehľad",
  robots: { index: false, follow: false },
}

const moneyFormatter = new Intl.NumberFormat("sk-SK", {
  style: "currency",
  currency: "EUR",
})

const dateFormatter = new Intl.DateTimeFormat("sk-SK", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})

export default async function AdminPage() {
  await requireAdminAccess()
  const result = await loadAdminData()

  if (!result.ok) {
    return <AdminError message={result.message} />
  }

  const metrics = result.metrics

  return (
    <main className="min-h-screen bg-[#f8f5f1]">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <div className="mb-5 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-md bg-[#f7eff5] px-2.5 py-1 text-xs font-semibold text-primary">
              <ShieldCheck className="size-3.5" />
              Admin
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">
              JobWest admin prehľad
            </h1>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Reálne dáta z portálu {siteConfig.portalDomain}: inzeráty, zvýraznenia, platby a tržby.
            </p>
          </div>
          <Button asChild variant="outline" className="bg-white">
            <Link href="/">
              Otvoriť portál
              <ExternalLink className="size-4" />
            </Link>
          </Button>
        </div>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon={<BriefcaseBusiness className="size-4" />} label="Všetky inzeráty" value={metrics.totals.ads} />
          <MetricCard icon={<Star className="size-4" />} label="TOP zvýraznenia" value={metrics.totals.topAds} />
          <MetricCard icon={<Crown className="size-4" />} label="Exclusive" value={metrics.totals.exclusiveAds} />
          <MetricCard icon={<BadgeEuro className="size-4" />} label="Tržby" value={formatMoney(metrics.totals.earningsCents)} />
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5">
              <h2 className="flex items-center gap-2 text-base font-semibold text-slate-950">
                <Globe2 className="size-4 text-primary" />
                Portály a domény
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Pripravené na samostatné sledovanie krajín/domén podľa `portal_code`.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Portál</th>
                    <th className="px-5 py-3 text-right">Inzeráty</th>
                    <th className="px-5 py-3 text-right">TOP</th>
                    <th className="px-5 py-3 text-right">Exclusive</th>
                    <th className="px-5 py-3 text-right">Platby</th>
                    <th className="px-5 py-3 text-right">Tržby</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {metrics.portals.map((portal) => (
                    <tr key={portal.code}>
                      <td className="px-5 py-3">
                        <span className="font-semibold text-slate-950">{portal.domain || portal.code}</span>
                        <span className="mt-0.5 block text-xs text-slate-500">{portal.code}</span>
                      </td>
                      <td className="px-5 py-3 text-right font-medium">{portal.ads}</td>
                      <td className="px-5 py-3 text-right">{portal.topAds}</td>
                      <td className="px-5 py-3 text-right">{portal.exclusiveAds}</td>
                      <td className="px-5 py-3 text-right">{portal.payments}</td>
                      <td className="px-5 py-3 text-right font-semibold text-primary">{formatMoney(portal.earningsCents)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-950">
              <Users className="size-4 text-primary" />
              Účty a platby
            </h2>
            <dl className="mt-4 grid gap-3">
              <AdminFact label="Zamestnávateľské účty" value={metrics.totals.employers} />
              <AdminFact label="Platby spolu" value={metrics.totals.payments} />
              <AdminFact label="Dokončené platby" value={metrics.totals.completedPayments} />
              <AdminFact label="Štandardné inzeráty" value={metrics.totals.standardAds} />
            </dl>
          </div>
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-2">
          <AdminTable title="Krajiny" icon={<BarChart3 className="size-4 text-primary" />}>
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Krajina</th>
                <th className="px-5 py-3 text-right">Inzeráty</th>
                <th className="px-5 py-3 text-right">TOP</th>
                <th className="px-5 py-3 text-right">Exclusive</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {metrics.countries.map((country) => (
                <tr key={country.code}>
                  <td className="px-5 py-3">
                    <span className={`flag flag-${country.code}`} />
                    <span className="ml-2 font-medium text-slate-950">{country.name}</span>
                  </td>
                  <td className="px-5 py-3 text-right">{country.ads}</td>
                  <td className="px-5 py-3 text-right">{country.topAds}</td>
                  <td className="px-5 py-3 text-right">{country.exclusiveAds}</td>
                </tr>
              ))}
            </tbody>
          </AdminTable>

          <AdminTable title="Portál podľa krajiny" icon={<Globe2 className="size-4 text-primary" />}>
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Portál</th>
                <th className="px-5 py-3">Krajina</th>
                <th className="px-5 py-3 text-right">Inzeráty</th>
                <th className="px-5 py-3 text-right">Platby</th>
                <th className="px-5 py-3 text-right">Tržby</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {metrics.portalCountries.length > 0 ? (
                metrics.portalCountries.map((metric) => (
                  <tr key={`${metric.portalCode}-${metric.countryCode}`}>
                    <td className="px-5 py-3">
                      <span className="font-medium text-slate-950">{metric.portalDomain || metric.portalCode}</span>
                      <span className="mt-0.5 block text-xs text-slate-500">{metric.portalCode}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`flag flag-${metric.countryCode}`} />
                      <span className="ml-2 text-slate-700">{metric.countryName}</span>
                    </td>
                    <td className="px-5 py-3 text-right">{metric.ads}</td>
                    <td className="px-5 py-3 text-right">{metric.payments}</td>
                    <td className="px-5 py-3 text-right font-semibold text-primary">{formatMoney(metric.earningsCents)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-5 py-6 text-sm text-slate-500" colSpan={5}>
                    Zatiaľ nie sú dáta pre porovnanie portálov podľa krajiny.
                  </td>
                </tr>
              )}
            </tbody>
          </AdminTable>
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-2">
          <AdminTable title="Posledné platby" icon={<BadgeEuro className="size-4 text-primary" />}>
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Dátum</th>
                <th className="px-5 py-3">Balík</th>
                <th className="px-5 py-3">Stav</th>
                <th className="px-5 py-3 text-right">Suma</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {metrics.recentPayments.length > 0 ? (
                metrics.recentPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-5 py-3 text-slate-600">{formatDate(payment.createdAt)}</td>
                    <td className="px-5 py-3 font-medium text-slate-950">{payment.tier}</td>
                    <td className="px-5 py-3">
                      <StatusPill status={payment.status} />
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-primary">{formatMoney(payment.amountCents)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-5 py-6 text-sm text-slate-500" colSpan={4}>Zatiaľ nie sú zapísané žiadne platby.</td>
                </tr>
              )}
            </tbody>
          </AdminTable>
        </section>

        <section className="mt-5 rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-base font-semibold text-slate-950">Najnovšie inzeráty</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {metrics.recentJobs.map((job) => (
              <div key={job.id} className="grid gap-2 px-5 py-4 md:grid-cols-[minmax(0,1fr)_160px_120px] md:items-center">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-950">{job.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{job.company}</p>
                </div>
                <p className="text-xs text-slate-500">{formatDate(job.createdAt)}</p>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">{job.highlightTier}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

async function requireAdminAccess() {
  const supabase = getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/")

  const metadataRole = getRole(user.app_metadata?.role)
  if (isAdminRole(metadataRole)) return

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  if (!isAdminRole(profile?.role)) redirect("/")
}

async function loadAdminData() {
  try {
    const supabase = getSupabaseServiceClient()
    const [jobsResult, paymentsResult, usersResult] = await Promise.all([
      supabase
        .from("jobs")
        .select("id,title,company,country_code,created_at,highlight_tier,is_top,topped_at,user_id,portal_code,portal_domain")
        .order("created_at", { ascending: false }),
      supabase
        .from("payments")
        .select("id,amount_cents,currency,created_at,job_id,portal_code,status,tier,user_id")
        .order("created_at", { ascending: false }),
      supabase.from("users").select("id,email,role"),
    ])

    const error = jobsResult.error ?? paymentsResult.error ?? usersResult.error

    if (error) {
      return { ok: false as const, message: error.message }
    }

    return {
      ok: true as const,
      metrics: getAdminMetrics({
        jobs: (jobsResult.data ?? []) as AdminJobRow[],
        payments: (paymentsResult.data ?? []) as AdminPaymentRow[],
        users: (usersResult.data ?? []) as AdminUserRow[],
      }),
    }
  } catch (error) {
    return {
      ok: false as const,
      message: error instanceof Error ? error.message : "Admin dáta sa nepodarilo načítať.",
    }
  }
}

function AdminError({ message }: { message: string }) {
  return (
    <main className="min-h-screen bg-[#f8f5f1] px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-lg border border-amber-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-amber-50 text-amber-700">
            <AlertTriangle className="size-5" />
          </span>
          <div>
            <h1 className="text-xl font-semibold text-slate-950">Admin dáta nie sú dostupné</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Pre portálový admin prehľad treba serverovo nastaviť Supabase service role kľúč
              a aplikovať migráciu admin metrík. Nezobrazujem žiadne náhradné alebo ukážkové dáta.
            </p>
            <p className="mt-3 rounded-md bg-slate-50 p-3 text-xs font-medium text-slate-600">{message}</p>
          </div>
        </div>
      </div>
    </main>
  )
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className="flex size-9 items-center justify-center rounded-md bg-[#f7eff5] text-primary">{icon}</span>
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
    </div>
  )
}

function AdminFact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-slate-100 bg-slate-50 px-3 py-2.5">
      <dt className="text-sm text-slate-600">{label}</dt>
      <dd className="text-sm font-semibold text-slate-950">{value}</dd>
    </div>
  )
}

function AdminTable({
  title,
  icon,
  children,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-950">
          {icon}
          {title}
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">{children}</table>
      </div>
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const isCompleted = status === "completed"

  return (
    <span className={isCompleted ? "rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800" : "rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"}>
      {status}
    </span>
  )
}

function getRole(value: unknown) {
  return typeof value === "string" ? value : null
}

function isAdminRole(role: string | null | undefined) {
  return role === "admin" || role === "owner"
}

function formatMoney(cents: number) {
  return moneyFormatter.format(cents / 100)
}

function formatDate(value: string) {
  if (!value) return "—"

  return dateFormatter.format(new Date(value))
}
