import type { Metadata } from "next"
import { notFound } from "next/navigation"
import JobDetail from "@/components/ui/job-detail"
import { getVisibleJobBySlug } from "@/lib/job-source"
import { getJobPostingStructuredData } from "@/lib/job-seo"
import { getJobPath } from "@/lib/jobs"

type JobPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: JobPageProps): Promise<Metadata> {
  const { slug } = await params
  const result = await getVisibleJobBySlug(slug)

  if (!result) {
    return {
      title: "Ponuka nenájdená",
      robots: { index: false, follow: false },
    }
  }

  const { job, isDemoMode } = result
  const location = [job.location, job.country?.name].filter(Boolean).join(", ")
  const description = `${job.title} - ${job.company}${location ? `, ${location}` : ""}. ${job.salary ? `Mzda ${job.salary}. ` : ""}${job.description}`.slice(0, 155)

  return {
    title: `${job.title} - ${job.company}`,
    description,
    robots: isDemoMode ? { index: false, follow: false } : undefined,
    alternates: {
      canonical: getJobPath(job),
    },
    openGraph: {
      title: `${job.title} - ${job.company}`,
      description,
      url: getJobPath(job),
      type: "article",
    },
  }
}

export default async function JobPage({ params }: JobPageProps) {
  const { slug } = await params
  const result = await getVisibleJobBySlug(slug)

  if (!result) notFound()

  const { job, isDemoMode } = result

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 md:px-6 md:py-8">
      {!isDemoMode && (
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getJobPostingStructuredData(job)).replace(/</g, "\\u003c"),
          }}
        />
      )}
      {isDemoMode && (
        <div data-cy="demo-data-warning" className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Toto je ukážková ponuka zobrazená iba preto, že produkčná databáza zatiaľ nevrátila publikované inzeráty.
        </div>
      )}
      <JobDetail job={job} backHref="/" headingLevel="h1" />
    </main>
  )
}
