import JobPortalClient from "@/components/ui/job-portal-client";
import { getVisibleJobs } from "@/lib/job-source";
import { getPortalStructuredData } from "@/lib/job-seo";
import { countries, getCountryPath } from "@/lib/countries";
import { getJobPath, parseSalary } from "@/lib/jobs";
import { getHighlightTier, type Job } from "@/lib/types";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  ChevronDown,
  CheckCircle2,
  Globe2,
  Home,
  MapPin,
  RotateCcw,
  Search,
  ShieldCheck,
} from "lucide-react";

export default async function JobPortalPage() {
  const { jobs, isDemoMode } = await getVisibleJobs();

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getPortalStructuredData(jobs, { includeJobList: !isDemoMode })).replace(/</g, "\\u003c"),
        }}
      />
      <PortalHero jobs={jobs} isDemoMode={isDemoMode} />
      <JobPortalClient jobs={jobs} />
    </>
  );
}

function PortalHero({ jobs, isDemoMode }: { jobs: Job[]; isDemoMode: boolean }) {
  const countryCodes = new Set(jobs.map((job) => job.country_code).filter(Boolean))
  const accommodationCount = jobs.filter((job) => job.accommodation_provided || job.accommodation_paid).length
  const highlightedCount = jobs.filter((job) => getHighlightTier(job) !== "standard").length
  const heroJobs = jobs
    .toSorted((a, b) => {
      const highlightRank = getHeroRank(b) - getHeroRank(a)

      if (highlightRank !== 0) return highlightRank

      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
    .slice(0, 3)
  const mapCountries = getHeroCountrySummaries(jobs)
  const countryHighlights = mapCountries.slice(0, 5)

  return (
    <section className="overflow-hidden border-b border-[#e4dfd8] bg-[linear-gradient(180deg,#ffffff_0%,#f7f8f4_100%)]">
      <div className="mx-auto max-w-screen-2xl px-4 md:px-6">
        <div className="grid min-w-0 grid-cols-1 gap-6 py-7 lg:grid-cols-[minmax(320px,390px)_minmax(420px,1fr)_minmax(360px,450px)] lg:items-center lg:py-8 xl:gap-8">
          <div className="w-full min-w-0 max-w-full">
            <h1 className="max-w-3xl text-3xl font-semibold leading-[1.08] tracking-tight text-[#241033] sm:text-4xl xl:text-5xl">
              Vyberte si krajinu, pozíciu aj podmienky vopred
            </h1>
            <p className="mt-4 max-w-[21rem] break-words text-base leading-7 text-[#625b68] sm:max-w-xl">
              Na JobWest zistíte mzdu, ubytovanie, lokalitu aj kontakt zamestnávateľa ešte predtým, než sa prihlásite.
            </p>

            <div className="mt-6 w-full max-w-xl overflow-hidden rounded-lg border border-[#d9d3dc] bg-white shadow-[0_18px_50px_rgba(36,16,51,0.07)]">
              <a
                href="#ponuky"
                className="flex min-h-[54px] items-center gap-3 border-b border-[#ebe7ec] px-4 text-sm font-medium text-[#6a6270] transition hover:bg-[#fbfaf8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                aria-label="Prejsť na vyhľadávanie pracovných ponúk"
              >
                <Search className="size-5 text-[#7a7280]" />
                <span>Názov práce, kľúčové slovo alebo spoločnosť</span>
              </a>

              <div className="space-y-3 p-3">
                <div className="flex flex-wrap gap-2">
                  {["Zvárač", "Skladník", "S ubytovaním"].map((item) => (
                    <a
                      key={item}
                      href="#ponuky"
                      className="inline-flex h-9 items-center gap-2 rounded-md border border-[#ddd8df] bg-[#fbfaf8] px-3 text-sm font-semibold text-[#2d2634] transition hover:border-[#c7b5c6] hover:text-primary"
                    >
                      {item}
                      <span aria-hidden="true" className="text-[#8a8290]">×</span>
                    </a>
                  ))}
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <a
                    href="#ponuky"
                    className="inline-flex h-11 items-center justify-between rounded-md border border-[#ddd8df] px-3 text-sm font-semibold text-[#4a4350] transition hover:border-[#c7b5c6] hover:text-primary"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Globe2 className="size-4" />
                      Krajina
                    </span>
                    <ChevronDown className="size-4 text-[#8a8290]" />
                  </a>
                  <a
                    href="#ponuky"
                    className="inline-flex h-11 items-center justify-between rounded-md border border-[#ddd8df] px-3 text-sm font-semibold text-[#4a4350] transition hover:border-[#c7b5c6] hover:text-primary"
                  >
                    Mzda od - do (€)
                    <ChevronDown className="size-4 text-[#8a8290]" />
                  </a>
                </div>

                <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                  <a
                    href="#ponuky"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    Hľadať ponuky
                  </a>
                  <a
                    href="#ponuky"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold text-[#6a6270] transition hover:bg-[#f3f1ee]"
                  >
                    Vymazať
                    <RotateCcw className="size-4" />
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-4 inline-flex max-w-full items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900 ring-1 ring-emerald-100">
              <ShieldCheck className="size-4 shrink-0" />
              <span className="truncate">Transparentné ponuky overené cez JobWest</span>
            </div>
          </div>

          <EuropeOpportunityMap countries={mapCountries} />

          <aside className="min-w-0 rounded-lg border border-[#e1dce4] bg-white p-3 shadow-[0_20px_60px_rgba(36,16,51,0.08)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-[#171321]">Aktuálne overené ponuky</h2>
                <p className="mt-1 text-sm text-[#6b6270]">Ukážka toho, čo kandidát vidí pred reakciou.</p>
              </div>
              <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-100">
                {jobs.length} {formatOfferCount(jobs.length)}
              </span>
            </div>

            {heroJobs.length > 0 ? (
              <div className="mt-4 overflow-hidden rounded-md border border-[#ece7ed]">
                {heroJobs.map((job) => (
                  <Link
                    key={job.id}
                    href={getJobPath(job)}
                    prefetch={false}
                    className="group grid grid-cols-[auto_minmax(0,1fr)] gap-3 border-b border-[#ece7ed] p-3 text-left transition last:border-b-0 hover:bg-[#fbfaf8] md:grid-cols-[auto_minmax(0,1fr)_auto]"
                  >
                    <span className="flex size-11 items-center justify-center rounded-md bg-[#f3f5f1] text-emerald-800">
                      <BriefcaseBusiness className="size-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-[#211a26] group-hover:text-primary">
                        {job.title}
                      </span>
                      <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#6b6270]">
                        <span className="inline-flex min-w-0 items-center gap-1">
                          <span className={`flag flag-${job.country_code?.toLowerCase()}`} />
                          <MapPin className="size-3" />
                          <span className="truncate">{job.country?.name ?? job.location}</span>
                        </span>
                        {(job.accommodation_provided || job.accommodation_paid) && (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 font-semibold text-emerald-800">
                            <Home className="size-3" />
                            ubytovanie
                          </span>
                        )}
                        {(job.contactInfo || job.companyName) && (
                          <span className="inline-flex items-center gap-1 rounded bg-[#f4f0f5] px-1.5 py-0.5 font-semibold text-[#5b2a62]">
                            <ShieldCheck className="size-3" />
                            kontakt
                          </span>
                        )}
                      </span>
                    </span>
                    <span className="flex items-center justify-between gap-3 md:block md:self-center md:text-right">
                      <span className="whitespace-nowrap text-sm font-semibold text-emerald-800">
                        {job.salary}
                      </span>
                      <ArrowRight className="size-4 text-[#837a88] transition group-hover:translate-x-0.5 group-hover:text-primary" />
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-md bg-[#fbf8fb] p-3 text-sm leading-6 text-[#6b6270]">
                Ponuky sa zobrazia po pridaní prvých inzerátov.
              </p>
            )}

            <div className="mt-4 grid grid-cols-3 divide-x divide-[#eadfe8] rounded-md border border-[#eadfe8] bg-[#fbf9fb]">
              <HeroStat label="ponúk" value={jobs.length.toString()} />
              <HeroStat label="krajín" value={countryCodes.size.toString()} />
              <HeroStat label="s ubytovaním" value={accommodationCount.toString()} />
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>
                {highlightedCount} {formatOfferCount(highlightedCount)} má TOP alebo Exclusive zvýraznenie pre vyššiu viditeľnosť.
              </span>
            </div>
          </aside>

          {isDemoMode && (
            <div data-cy="demo-data-warning" className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 lg:col-span-3">
              Zobrazujem ukážkové ponuky, pretože databáza zatiaľ nevrátila žiadne publikovateľné inzeráty.
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-[#e4dfd8] bg-[#f2f5ef]">
        <div className="mx-auto grid max-w-screen-2xl gap-3 px-4 py-4 md:grid-cols-[auto_repeat(5,minmax(0,1fr))_auto] md:px-6">
          <div className="flex items-center text-sm font-semibold text-[#241033] md:pr-2">
            Objavte ponuky podľa krajiny
          </div>
          {countryHighlights.map((country) => (
            <CountryDiscoveryCard key={country.code} country={country} />
          ))}
          <Link
            href="/krajiny"
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-md border border-[#d8d3dd] bg-white px-4 text-sm font-semibold text-[#4a4350] shadow-sm transition hover:border-[#b989ad] hover:text-primary"
          >
            <Globe2 className="size-4" />
            Všetky krajiny
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

function getHeroRank(job: Pick<Job, "highlightTier" | "isTop">): number {
  const tier = getHighlightTier(job)

  if (tier === "exclusive") return 2
  if (tier === "top" || job.isTop) return 1

  return 0
}

function formatOfferCount(count: number): string {
  if (count === 1) return "ponuka"
  if (count >= 2 && count <= 4) return "ponuky"

  return "ponúk"
}

type HeroCountrySummary = {
  code: string
  count: number
  fromSalary: string | null
  labelX: number
  labelY: number
  name: string
  x: number
  y: number
}

const mapMarkerPositions: Record<string, { x: number; y: number }> = {
  gb: { x: 22, y: 32 },
  ie: { x: 15, y: 47 },
  nl: { x: 38, y: 39 },
  de: { x: 51, y: 48 },
  ch: { x: 43, y: 66 },
  at: { x: 58, y: 66 },
  fr: { x: 33, y: 61 },
  cz: { x: 58, y: 53 },
  pl: { x: 68, y: 42 },
  it: { x: 56, y: 78 },
  dk: { x: 48, y: 22 },
  se: { x: 61, y: 12 },
  es: { x: 24, y: 79 },
  pt: { x: 14, y: 80 },
}

const mapLabelOffsets: Record<string, { labelX: number; labelY: number }> = {
  ie: { labelX: -18, labelY: -18 },
  nl: { labelX: 16, labelY: -38 },
  de: { labelX: 58, labelY: -20 },
  ch: { labelX: -42, labelY: 28 },
  at: { labelX: 62, labelY: 20 },
}

const preferredMapCountries = ["de", "nl", "at", "ch", "ie"]

function getHeroCountrySummaries(jobs: Job[]): HeroCountrySummary[] {
  const countryJobs = new Map<string, Job[]>()

  for (const job of jobs) {
    const code = job.country_code?.toLowerCase()
    if (!code || !mapMarkerPositions[code]) continue
    countryJobs.set(code, [...(countryJobs.get(code) ?? []), job])
  }

  const activeCodes = [...countryJobs.keys()].sort((a, b) => {
    const aPreferred = preferredMapCountries.includes(a)
    const bPreferred = preferredMapCountries.includes(b)
    if (aPreferred !== bPreferred) return aPreferred ? -1 : 1

    const countDifference = (countryJobs.get(b)?.length ?? 0) - (countryJobs.get(a)?.length ?? 0)
    if (countDifference !== 0) return countDifference

    return preferredMapCountries.indexOf(a) - preferredMapCountries.indexOf(b)
  })

  const codes = activeCodes.length > 0 ? activeCodes : preferredMapCountries

  return codes.slice(0, 5).map((code) => {
    const country = countries.find((item) => item.code === code)
    const jobsForCountry = countryJobs.get(code) ?? []
    const salaryMinimums = jobsForCountry
      .map((job) => parseSalary(job.salary, job.salaryBasis)?.min)
      .filter((value): value is number => typeof value === "number")
      .sort((a, b) => a - b)

    return {
      code,
      count: jobsForCountry.length,
      fromSalary: salaryMinimums[0] ? `od ${formatCurrency(salaryMinimums[0])}` : null,
      ...(mapLabelOffsets[code] ?? { labelX: 0, labelY: -18 }),
      name: country?.name ?? code.toUpperCase(),
      ...mapMarkerPositions[code],
    }
  })
}

function formatCurrency(value: number): string {
  return `${new Intl.NumberFormat("sk-SK", { maximumFractionDigits: 0 }).format(value)} €`
}

function EuropeOpportunityMap({ countries: countrySummaries }: { countries: HeroCountrySummary[] }) {
  return (
    <div className="relative min-h-[360px] w-full min-w-0 overflow-hidden rounded-lg border border-[#dde3d8] bg-[#eef3eb] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] lg:min-h-[430px]">
      <svg
        className="absolute inset-0 size-full text-[#dbe5d6]"
        viewBox="0 0 720 520"
        aria-hidden="true"
      >
        <rect width="720" height="520" fill="#eef3eb" />
        <path d="M86 266c35-55 75-88 121-101 52-15 88 4 126-24 42-30 44-83 89-104 54-25 118 16 142 60 26 47 10 96 45 128 26 24 70 17 93 49 23 33 0 87-34 116-54 46-142 42-201 17-36-16-58-39-91-34-39 6-48 43-88 50-48 9-73-36-129-32-31 2-52 18-77 5-37-20-30-86 4-130Z" fill="currentColor" />
        <path d="M158 153c25-37 55-63 91-76 47-16 88-5 99 27 13 37-25 72-55 91-41 26-111 46-141 9-11-14-6-33 6-51Z" fill="#e6ede2" />
        <path d="M430 358c31-18 86-13 113 10 24 21 25 56-1 78-31 26-95 23-126-3-29-24-21-64 14-85Z" fill="#e4ecdf" />
        <path d="M220 382c18 17 11 48-14 62-26 14-62 6-78-17-17-24-5-56 24-66 22-8 51 3 68 21Z" fill="#e4ecdf" />
        <path d="M350 95c63-18 112-9 145 26" fill="none" stroke="#d1dccb" strokeWidth="2" />
        <path d="M198 312c83-48 184-56 312-25" fill="none" stroke="#d1dccb" strokeWidth="2" />
      </svg>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_52%,rgba(38,121,83,0.22),transparent_25%),radial-gradient(circle_at_45%_62%,rgba(38,121,83,0.12),transparent_32%)]" />

      <div className="absolute left-4 top-4 hidden overflow-hidden rounded-md border border-[#d7dce0] bg-white shadow-sm sm:block">
        <button className="flex size-9 items-center justify-center border-b border-[#e4e6e8] text-lg font-semibold text-[#241033]" aria-label="Priblížiť mapu">+</button>
        <button className="flex size-9 items-center justify-center text-lg font-semibold text-[#241033]" aria-label="Oddialiť mapu">-</button>
      </div>

      {countrySummaries.map((country) => (
        <CountryMapMarker key={country.code} country={country} />
      ))}

      <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-md border border-[#d8ded6] bg-white/90 px-3 py-2 text-xs font-medium text-[#4d5660] shadow-sm backdrop-blur">
        <span className="relative flex size-4 items-center justify-center rounded-full bg-emerald-50">
          <span className="size-2 rounded-full bg-emerald-700" />
        </span>
        Krajina s najviac ponukami
      </div>
    </div>
  )
}

function CountryMapMarker({ country }: { country: HeroCountrySummary }) {
  return (
    <Link
      href={getCountryPath(country.code)}
      prefetch={false}
      className="group absolute size-5 -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${country.x}%`, top: `${country.y}%` }}
    >
      <span className="absolute inset-0 flex items-center justify-center rounded-full bg-emerald-100/80">
        <span className="size-3 rounded-full border-2 border-white bg-emerald-700 shadow-[0_0_0_1px_rgba(16,92,58,0.25)]" />
      </span>
      <span
        className="absolute left-1/2 top-1/2 hidden min-w-[126px] rounded-md border border-[#dedbe2] bg-white px-3 py-2 text-sm shadow-[0_12px_30px_rgba(36,16,51,0.12)] transition group-hover:border-[#b989ad] sm:block"
        style={{ transform: `translate(calc(-50% + ${country.labelX}px), calc(-100% + ${country.labelY}px))` }}
      >
        <span className="flex items-center gap-2 font-semibold text-[#241033]">
          <span className={`flag flag-${country.code}`} />
          {country.name}
        </span>
        <span className="mt-1 block text-xs text-[#5f6670]">
          {country.count} {formatOfferCount(country.count)}
        </span>
      </span>
    </Link>
  )
}

function CountryDiscoveryCard({ country }: { country: HeroCountrySummary }) {
  return (
    <Link
      href={getCountryPath(country.code)}
      prefetch={false}
      className="flex min-h-14 items-center justify-between gap-3 rounded-md border border-[#d8d3dd] bg-white px-3 shadow-sm transition hover:border-[#b989ad] hover:text-primary"
    >
      <span className="min-w-0">
        <span className="flex items-center gap-2 text-sm font-semibold text-[#241033]">
          <span className={`flag flag-${country.code}`} />
          {country.name}
        </span>
        <span className="mt-0.5 block text-xs text-[#6a6270]">
          {country.count} {formatOfferCount(country.count)}
        </span>
      </span>
      {country.fromSalary && (
        <span className="whitespace-nowrap text-xs font-semibold text-emerald-800">{country.fromSalary}</span>
      )}
    </Link>
  )
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <span className="px-3 py-3 text-center">
      <span className="block text-xl font-semibold leading-none text-[#171321]">{value}</span>
      <span className="mt-1 block text-[11px] font-medium text-[#786f7d]">{label}</span>
    </span>
  )
}
