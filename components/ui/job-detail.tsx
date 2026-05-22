"use client"

import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, Briefcase, Home, Building2, ShieldCheck } from "./icons"
import { Job, getHighlightTier } from "@/lib/types"
import { formatJobType, formatSalaryBasis, formatSalaryUnit, getJobTrustBadges, parseSalary } from "@/lib/jobs"
import { getJobDetailSections } from "@/lib/job-content"

interface JobDetailProps {
  job: Job
  onBack?: () => void
  backHref?: string
  headingLevel?: "h1" | "h2"
}

const dateFormatter = new Intl.DateTimeFormat("sk-SK")

export default function JobDetail({ job, onBack, backHref = "/", headingLevel = "h2" }: JobDetailProps) {
  const tier = getHighlightTier(job)
  const isExclusive = tier === "exclusive"
  const isTop = tier === "top"
  const formattedDate = formatDate(job.created_at)
  const detailSections = getJobDetailSections(job)

  return (
    <div>
      {onBack ? (
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1.5 size-4" />
          Späť na zoznam ponúk
        </Button>
      ) : (
        <Button
          asChild
          variant="ghost"
          className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <Link href={backHref}>
            <ArrowLeft className="mr-1.5 size-4" />
            Späť na zoznam ponúk
          </Link>
        </Button>
      )}

      <div className={`rounded-lg border bg-card overflow-hidden ${isExclusive ? "ring-1 ring-amber-400" : isTop ? "ring-1 ring-amber-300" : ""}`}>
        <div className={`p-5 md:p-6 ${isExclusive ? "bg-amber-50/50" : isTop ? "bg-amber-50/30" : "bg-muted/20"}`}>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className={`size-12 rounded-lg flex items-center justify-center shrink-0 text-lg font-semibold ${isExclusive ? "bg-amber-100 text-amber-700" : isTop ? "bg-amber-100 text-amber-800" : "bg-muted text-muted-foreground"}`}>
                {(job.company?.[0] ?? job.title[0]).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  {headingLevel === "h1" ? (
                    <h1 className="text-xl md:text-2xl font-semibold">{job.title}</h1>
                  ) : (
                    <h2 className="text-xl md:text-2xl font-semibold">{job.title}</h2>
                  )}
                  {(isTop || isExclusive) && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${isExclusive ? "bg-amber-600 text-white" : "bg-amber-500 text-white"}`}>
                      {isExclusive ? "Exclusive" : "TOP"}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground text-sm flex items-center gap-1 mt-0.5">
                  <Building2 className="size-3.5" />
                  {job.company}
                </p>
              </div>
            </div>
            {job.salary && (
              <div data-cy="salary-clarity" className="shrink-0 rounded-lg bg-emerald-50 px-3 py-2 text-right">
                <span className="inline-flex items-center text-base font-semibold text-emerald-700">
                  {job.salary}
                </span>
                <p className="mt-0.5 text-xs font-medium text-emerald-700/80">
                  {formatSalaryDetail(job)}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="p-5 md:p-6 space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            {job.country && (
              <Badge variant="outline" className="rounded gap-1.5">
                <div className={`flag flag-${job.country.code}`} />
                {job.country.name}
              </Badge>
            )}
            <Badge variant="outline" className="rounded gap-1">
              <Briefcase className="size-3" />
              {formatJobType(job.jobType)}
            </Badge>
            <Badge variant="outline" className="rounded">
              {job.category}
            </Badge>
            {job.accommodation_provided && (
              <Badge className="bg-emerald-50 text-emerald-800 border-0 rounded gap-1">
                <Home className="size-3" />
                Ubytovanie zabezpečené
              </Badge>
            )}
            {job.accommodation_paid && (
              <Badge className="bg-green-50 text-green-700 border-0 rounded gap-1">
                Ubytovanie hradené
              </Badge>
            )}
            {getJobTrustBadges(job).map((badge) => (
              <Badge key={badge.id} data-cy="job-trust-badge" className="bg-slate-100 text-slate-700 border-0 rounded gap-1">
                <ShieldCheck className="size-3" />
                {badge.label}
              </Badge>
            ))}
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2">Popis ponuky</h3>
            <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {job.description}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {detailSections.map((section) => (
              <section key={section.title} className="rounded-lg border border-slate-200 bg-[#fbfcf8] p-4">
                <h3 className="text-sm font-semibold text-slate-950">{section.title}</h3>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                  {section.items.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald-700" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          {(job.accommodation_provided || job.accommodation_paid) && (
            <div className="rounded-lg border bg-muted/20 p-4">
              <h3 className="text-sm font-semibold mb-2">Benefity</h3>
              <div className="space-y-1.5">
                {job.accommodation_provided && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="size-1.5 rounded-full bg-primary shrink-0" />
                    Ubytovanie <span className="font-medium text-foreground">zabezpečené</span>
                  </div>
                )}
                {job.accommodation_paid && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="size-1.5 rounded-full bg-green-500 shrink-0" />
                    Ubytovanie <span className="font-medium text-foreground">plne hradené zamestnávateľom</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="rounded-lg border bg-muted/20 p-4">
            <h3 className="text-sm font-semibold mb-1">Kontaktné informácie</h3>
            {job.companyName && <p className="text-sm text-muted-foreground">{job.companyName}</p>}
            {job.contactInfo && <p className="text-sm text-muted-foreground">{job.contactInfo}</p>}
            {!job.companyName && !job.contactInfo && (
              <p className="text-sm text-muted-foreground">Kontakt je uvedený v popise ponuky, ak ho zadávateľ doplnil.</p>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
            <Clock className="size-3" />
            Uverejnené: {formattedDate}
          </div>
        </div>
      </div>
    </div>
  )
}

function formatDate(value: string) {
  return dateFormatter.format(new Date(value))
}

function formatSalaryDetail(job: Job) {
  const salary = parseSalary(job.salary, job.salaryBasis)

  if (!salary) return "typ mzdy nešpecifikovaný"
  return `${formatSalaryUnit(salary.unitText)}, ${formatSalaryBasis(salary.basis)}`
}
