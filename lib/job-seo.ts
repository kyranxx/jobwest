import { getJobPath, parseSalary } from "@/lib/jobs"
import { getJobPostingDescriptionHtml } from "@/lib/job-content"
import type { Job } from "@/lib/types"
import { siteConfig } from "@/lib/site"

const siteUrl = siteConfig.url

export function getAbsoluteJobUrl(job: Pick<Job, "id" | "title">): string {
  return `${siteUrl}${getJobPath(job)}`
}

export function getPortalStructuredData(jobs: Job[], options: { includeJobList?: boolean } = {}) {
  const includeJobList = options.includeJobList ?? true

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: siteConfig.name,
        url: siteUrl,
        contactPoint: {
          "@type": "ContactPoint",
          email: siteConfig.contactEmail,
          contactType: "customer support",
          availableLanguage: ["sk"],
        },
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: siteConfig.name,
        inLanguage: "sk-SK",
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      ...(includeJobList
        ? [
            {
              "@type": "ItemList",
              "@id": `${siteUrl}/#job-list`,
              name: "Práca v zahraničí",
              numberOfItems: jobs.length,
              itemListElement: jobs.slice(0, 20).map((job, index) => ({
                "@type": "ListItem",
                position: index + 1,
                url: getAbsoluteJobUrl(job),
              })),
            },
          ]
        : []),
    ],
  }
}

export function getJobPostingStructuredData(job: Job) {
  const baseSalary = getBaseSalary(job)

  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "@id": `${getAbsoluteJobUrl(job)}#jobposting`,
    url: getAbsoluteJobUrl(job),
    title: job.title,
    description: getJobPostingDescriptionHtml(job),
    datePosted: job.created_at,
    validThrough: getValidThrough(job.created_at),
    employmentType: getEmploymentType(job.jobType),
    directApply: false,
    hiringOrganization: {
      "@type": "Organization",
      name: job.company,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location,
        addressCountry: job.country?.name ?? job.country_code.toUpperCase(),
      },
    },
    ...(baseSalary ? { baseSalary } : {}),
    ...(job.accommodation_provided || job.accommodation_paid
      ? { jobBenefits: job.accommodation_paid ? "Ubytovanie hradené" : "Ubytovanie zabezpečené" }
      : {}),
  }
}

function getValidThrough(createdAt: string) {
  const date = new Date(createdAt)
  date.setDate(date.getDate() + 60)
  return date.toISOString()
}

function getEmploymentType(jobType: string) {
  if (jobType === "brigada") return "TEMPORARY"
  if (jobType === "zivnost") return "CONTRACTOR"
  return "FULL_TIME"
}

function getBaseSalary(job: Pick<Job, "salary" | "salaryBasis">) {
  const parsedSalary = parseSalary(job.salary, job.salaryBasis)

  if (!parsedSalary) return null

  const quantitativeValue =
    parsedSalary.min !== parsedSalary.max
      ? {
          "@type": "QuantitativeValue",
          minValue: parsedSalary.min,
          maxValue: parsedSalary.max,
          unitText: parsedSalary.unitText,
        }
      : job.salary.toLowerCase().includes("od")
        ? {
            "@type": "QuantitativeValue",
            minValue: parsedSalary.min,
            unitText: parsedSalary.unitText,
          }
        : {
            "@type": "QuantitativeValue",
            value: parsedSalary.min,
            unitText: parsedSalary.unitText,
          }

  return {
    "@type": "MonetaryAmount",
    currency: parsedSalary.currency,
    value: quantitativeValue,
  }
}
