import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, BriefcaseBusiness } from "lucide-react"
import JobPortalClient from "@/components/ui/job-portal-client"
import { getVisibleJobs } from "@/lib/job-source"
import { getPortalStructuredData } from "@/lib/job-seo"
import { siteConfig } from "@/lib/site"

export const metadata: Metadata = {
  title: "Pracovné ponuky v zahraničí",
  description: "Prehliadajte aktuálne pracovné ponuky v zahraničí podľa krajiny, mzdy, typu práce, jazyka a ubytovania.",
  alternates: {
    canonical: "/ponuky",
  },
  openGraph: {
    title: "Pracovné ponuky v zahraničí",
    description: "Aktuálne pracovné ponuky v zahraničí s jasnou mzdou, lokalitou a podmienkami.",
    url: "/ponuky",
    type: "website",
  },
}

export default async function JobsIndexPage() {
  const { jobs, isDemoMode } = await getVisibleJobs()

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getPortalStructuredData(jobs, { includeJobList: !isDemoMode })).replace(/</g, "\\u003c"),
        }}
      />
      <main>
        <section className="border-b border-[#e4dfd8] bg-white">
          <div className="mx-auto max-w-screen-2xl px-4 py-6 md:px-6 md:py-8">
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
                <div className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-800">
                  <BriefcaseBusiness className="size-4" />
                  {siteConfig.name}
                </div>
                <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-[#241033] md:text-4xl">
                  Pracovné ponuky v zahraničí
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-[#625b68] md:text-base">
                  Vyberte si krajinu, mzdu, typ práce aj ubytovanie v jednom prehľadnom zozname.
                </p>
              </div>
              <div className="rounded-lg border border-[#ded9df] bg-[#fbfaf8] p-4">
                <p className="text-3xl font-semibold text-[#241033]">{jobs.length}</p>
                <p className="mt-1 text-sm font-medium text-[#625b68]">
                  {formatOfferCount(jobs.length)} v aktuálnom zozname
                </p>
              </div>
            </div>
            {isDemoMode && (
              <div data-cy="demo-data-warning" className="mt-5 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                Zobrazené ponuky sú ukážkové, kým produkčná databáza nevráti reálne publikované inzeráty.
              </div>
            )}
          </div>
        </section>
        <JobPortalClient jobs={jobs} />
      </main>
    </>
  )
}

function formatOfferCount(count: number) {
  if (count === 1) return "ponuka"
  if (count >= 2 && count <= 4) return "ponuky"

  return "ponúk"
}
