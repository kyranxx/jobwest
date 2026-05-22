import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Building2, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { countries, getCountryInPhrase, getCountryPath, getCountrySearchTitle } from "@/lib/countries"
import { getVisibleJobs } from "@/lib/job-source"
import { formatJobType, getJobPath } from "@/lib/jobs"
import { siteConfig } from "@/lib/site"

const siteUrl = siteConfig.url

type CountryPageProps = {
  params: Promise<{ code: string }>
}

export function generateStaticParams() {
  return countries.map((country) => ({ code: country.code }))
}

export async function generateMetadata({ params }: CountryPageProps): Promise<Metadata> {
  const { code } = await params
  const country = countries.find((item) => item.code === code.toLowerCase())

  if (!country) {
    return {
      title: "Krajina nenájdená",
      robots: { index: false, follow: false },
    }
  }

  const { jobs, isDemoMode } = await getVisibleJobs()
  const countryJobs = jobs.filter((job) => job.country_code === country.code)
  const title = getCountrySearchTitle(country.code, country.name)
  const inCountry = getCountryInPhrase(country.code, country.name)
  const description = `Aktuálne pracovné ponuky ${inCountry}. Prehľadná mzda, lokalita, typ práce a informácia o ubytovaní.`

  return {
    title,
    description,
    robots: {
      index: !isDemoMode && countryJobs.length > 0,
      follow: true,
    },
    alternates: {
      canonical: getCountryPath(country.code),
    },
    openGraph: {
      title,
      description,
      url: getCountryPath(country.code),
      type: "website",
    },
  }
}

export default async function CountryJobsPage({ params }: CountryPageProps) {
  const { code } = await params
  const country = countries.find((item) => item.code === code.toLowerCase())

  if (!country) notFound()

  const { jobs, isDemoMode } = await getVisibleJobs()
  const countryJobs = jobs.filter((job) => job.country_code === country.code)
  const title = getCountrySearchTitle(country.code, country.name)
  const inCountry = getCountryInPhrase(country.code, country.name)
  const marketInfo = getCountryMarketInfo(country.name, inCountry, countryJobs)
  const itemList = isDemoMode ? null : {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: title,
    numberOfItems: countryJobs.length,
    itemListElement: countryJobs.slice(0, 50).map((job, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${siteUrl}${getJobPath(job)}`,
    })),
  }

  return (
    <main className="min-h-screen bg-[#f4f6f1]">
      {itemList && (
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(itemList).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <div className="mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-10">
        <Button asChild variant="ghost" className="mb-5 -ml-2 text-slate-600">
          <Link href="/" prefetch={false}>
            <ArrowLeft className="size-4" />
            Späť na ponuky
          </Link>
        </Button>

        <header className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_12px_40px_rgba(24,42,31,0.04)] md:p-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800">
                <span className={`flag flag-${country.code}`} />
                {country.name}
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">{title}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Pracovné ponuky {inCountry} s jasnou mzdou, lokalitou a informáciou o ubytovaní.
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 px-4 py-3 text-left md:text-right">
              <p className="text-2xl font-semibold text-slate-950">{countryJobs.length}</p>
              <p className="text-xs font-medium text-slate-500">aktuálnych ponúk</p>
            </div>
          </div>
        </header>

        {isDemoMode && (
          <div data-cy="demo-data-warning" className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Zobrazené ponuky sú ukážkové. Stránka krajiny je pripravená, ale nebude indexovaná ako produkčný obsah, kým databáza nevráti reálne publikované inzeráty.
          </div>
        )}

        <section className="mt-5 grid gap-3 md:grid-cols-3">
          {marketInfo.map((section) => (
            <div
              key={section.title}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_12px_40px_rgba(24,42,31,0.04)]"
            >
              <h2 className="text-sm font-semibold text-slate-950">{section.title}</h2>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald-700" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_40px_rgba(24,42,31,0.04)]">
          {countryJobs.length > 0 ? (
            countryJobs.map((job) => (
              <Link
                key={job.id}
                href={getJobPath(job)}
                prefetch={false}
                className="grid gap-3 border-b border-slate-100 px-4 py-4 transition last:border-b-0 hover:bg-[#fbfcf8] md:grid-cols-[minmax(0,1fr)_190px] md:items-center md:px-5"
              >
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold leading-snug text-slate-950">{job.title}</h2>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="size-3" />
                      {job.company}
                    </span>
                    {job.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3" />
                        {job.location}
                      </span>
                    )}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{job.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge variant="secondary" className="rounded-full bg-slate-100 text-xs text-slate-700">
                      {formatJobType(job.jobType)}
                    </Badge>
                    {(job.accommodation_provided || job.accommodation_paid) && (
                      <Badge className="rounded-full border-0 bg-emerald-50 text-xs text-emerald-800">
                        Ubytovanie
                      </Badge>
                    )}
                  </div>
                </div>
                {job.salary && (
                  <div className="rounded-lg bg-emerald-50 px-3 py-2 text-left md:text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700/70">Mzda</p>
                    <p className="mt-0.5 text-sm font-semibold text-emerald-800">{job.salary}</p>
                  </div>
                )}
              </Link>
            ))
          ) : (
            <div className="p-6 text-sm text-slate-600">
              Aktuálne nemáme publikované ponuky pre túto krajinu.
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

function getCountryMarketInfo(
  countryName: string,
  inCountry: string,
  jobs: Awaited<ReturnType<typeof getVisibleJobs>>["jobs"],
) {
  const titles = unique(jobs.map((job) => job.title)).slice(0, 4)
  const jobTypes = unique(jobs.map((job) => formatJobType(job.jobType).toLowerCase())).slice(0, 3)
  const salaries = unique(jobs.map((job) => job.salary)).slice(0, 3)
  const hasHousing = jobs.some((job) => job.accommodation_provided || job.accommodation_paid)

  return [
    {
      title: `Ponuky ${inCountry}`,
      items: [
        jobs.length > 0
          ? `Aktuálne tu nájdete ${jobs.length} ${jobs.length === 1 ? "ponuku" : jobs.length >= 2 && jobs.length <= 4 ? "ponuky" : "ponúk"} pre ${countryName}.`
          : `Ponuky pre ${countryName} sem pridáme po ich overení.`,
        titles.length > 0
          ? `Najčastejšie pozície: ${titles.join(", ")}.`
          : "Stránka ostáva pripravená pre nové overené pracovné ponuky.",
        "Každý inzerát ukazuje mzdu, lokalitu, typ spolupráce a dostupné informácie o bývaní.",
      ],
    },
    {
      title: "Mzda a spolupráca",
      items: [
        salaries.length > 0
          ? `Viditeľné mzdové rozpätia: ${salaries.join(", ")}.`
          : "Mzda sa zobrazuje priamo v zozname, keď je ponuka publikovaná.",
        jobTypes.length > 0
          ? `Typ spolupráce: ${jobTypes.join(", ")}.`
          : "Typ spolupráce bude vždy uvedený pri konkrétnej ponuke.",
        "Pred reakciou odporúčame overiť netto/brutto mzdu, turnusy, nástup a zmluvné podmienky.",
      ],
    },
    {
      title: "Ubytovanie a kontakt",
      items: [
        hasHousing
          ? "Niektoré ponuky majú zabezpečené alebo hradené ubytovanie."
          : "Ubytovanie nie je pri aktuálnych ponukách zvýraznené ako zabezpečené.",
        "Kontakt a ďalšie praktické informácie sú dostupné v detaile ponuky.",
        "JobWest drží rozhranie jednoduché, aby sa dalo rýchlo porovnať viac krajín naraz.",
      ],
    },
  ]
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))]
}
