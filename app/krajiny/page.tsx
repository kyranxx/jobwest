import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ArrowRight, BriefcaseBusiness, MapPin } from "lucide-react"
import { countries, getCountryInPhrase, getCountryPath, getCountrySearchTitle } from "@/lib/countries"
import { getVisibleJobs } from "@/lib/job-source"
import { parseSalary } from "@/lib/jobs"
import type { Job } from "@/lib/types"

export const metadata: Metadata = {
  title: "Práca podľa krajiny",
  description: "Prehľad pracovných ponúk v zahraničí podľa krajiny. Porovnajte krajiny, mzdy, ubytovanie a aktuálne dostupné pozície.",
  alternates: {
    canonical: "/krajiny",
  },
  openGraph: {
    title: "Práca podľa krajiny",
    description: "Pracovné ponuky v zahraničí zoradené podľa krajiny.",
    url: "/krajiny",
    type: "website",
  },
}

export default async function CountriesIndexPage() {
  const { jobs, isDemoMode } = await getVisibleJobs()
  const countrySummaries = countries.map((country) => {
    const countryJobs = jobs.filter((job) => job.country_code === country.code)
    const salaryMinimum = getSalaryMinimum(countryJobs)

    return {
      ...country,
      count: countryJobs.length,
      sampleJob: countryJobs[0] ?? null,
      salaryMinimum,
    }
  })
  const activeCountries = countrySummaries.filter((country) => country.count > 0).length

  return (
    <main className="min-h-screen bg-[#f4f6f1]">
      <section className="border-b border-[#e4dfd8] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-10">
          <Link
            href="/"
            prefetch={false}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#625b68] transition hover:text-primary"
          >
            <ArrowLeft className="size-4" />
            Späť na úvod
          </Link>
          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
            <div>
              <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-[#241033] md:text-4xl">
                Práca podľa krajiny
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[#625b68] md:text-base">
                Prejdite priamo na krajinu, porovnajte počet ponúk a otvorte overené inzeráty.
              </p>
            </div>
            <div className="rounded-lg border border-[#ded9df] bg-[#fbfaf8] p-4">
              <p className="text-3xl font-semibold text-[#241033]">{activeCountries}</p>
              <p className="mt-1 text-sm font-medium text-[#625b68]">krajín s aktuálnymi ponukami</p>
            </div>
          </div>
          {isDemoMode && (
            <div data-cy="demo-data-warning" className="mt-5 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Zobrazené počty vychádzajú z ukážkových ponúk, kým produkčná databáza nevráti reálne publikované inzeráty.
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-3 px-4 py-6 md:grid-cols-2 md:px-6 lg:grid-cols-3">
        {countrySummaries.map((country) => (
          <Link
            key={country.code}
            href={getCountryPath(country.code)}
            prefetch={false}
            className="group flex min-h-52 flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-[0_12px_40px_rgba(24,42,31,0.04)] transition hover:border-[#b989ad] hover:shadow-[0_18px_48px_rgba(36,16,51,0.08)]"
          >
            <span>
              <span className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-lg font-semibold text-[#241033]">
                  <span className={`flag flag-${country.code}`} />
                  {country.name}
                </span>
                <ArrowRight className="size-4 text-[#837a88] transition group-hover:translate-x-0.5 group-hover:text-primary" />
              </span>
              <span className="mt-3 block text-sm leading-6 text-[#625b68]">
                {getCountrySearchTitle(country.code, country.name)}: {country.count} {formatOfferCount(country.count)} {getCountryInPhrase(country.code, country.name)}.
              </span>
            </span>

            <span className="mt-5 block rounded-md bg-[#f6f7f2] p-3">
              {country.sampleJob ? (
                <>
                  <span className="flex items-center gap-2 text-xs font-semibold uppercase text-emerald-800">
                    <BriefcaseBusiness className="size-3.5" />
                    Najnovšia ponuka
                  </span>
                  <span className="mt-1 block truncate text-sm font-semibold text-[#241033]">{country.sampleJob.title}</span>
                  <span className="mt-1 flex items-center gap-1 text-xs text-[#625b68]">
                    <MapPin className="size-3" />
                    {country.sampleJob.location || country.name}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-sm font-semibold text-[#241033]">Krajina pripravená</span>
                  <span className="mt-1 block text-xs leading-5 text-[#625b68]">
                    Ponuky sa zobrazia po publikovaní reálnych inzerátov.
                  </span>
                </>
              )}
              {country.salaryMinimum && (
                <span className="mt-3 block text-xs font-semibold text-emerald-800">
                  Mzda od {formatCurrency(country.salaryMinimum)}
                </span>
              )}
            </span>
          </Link>
        ))}
      </section>
    </main>
  )
}

function getSalaryMinimum(jobs: Job[]) {
  const salaries = jobs
    .map((job) => parseSalary(job.salary, job.salaryBasis)?.min)
    .filter((value): value is number => typeof value === "number")
    .sort((a, b) => a - b)

  return salaries[0] ?? null
}

function formatCurrency(value: number) {
  return `${new Intl.NumberFormat("sk-SK", { maximumFractionDigits: 0 }).format(value)} EUR`
}

function formatOfferCount(count: number) {
  if (count === 1) return "ponuka"
  if (count >= 2 && count <= 4) return "ponuky"

  return "ponúk"
}
