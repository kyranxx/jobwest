"use client"

import * as React from "react"
import Link from "next/link"
import { BookmarkPlus, Bookmark, Clock, Building2, ChevronRight, MapPin, ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Job, getHighlightTier } from "@/lib/types"
import { cn } from "@/lib/utils"
import {
  formatJobType,
  formatSalaryBasis,
  formatSalaryUnit,
  getJobPath,
  getJobTrustBadges,
  parseSalary,
  type TrustBadge,
} from "@/lib/jobs"

interface JobCardProps {
  job: Job
  isSaved: boolean
  onToggleSave: (jobId: Job["id"]) => void
  viewMode?: "grid" | "list"
}

const dateFormatter = new Intl.DateTimeFormat("sk-SK")

export function JobCard({ job, isSaved, onToggleSave, viewMode = "grid" }: JobCardProps) {
  const tier = getHighlightTier(job)
  const isExclusive = tier === "exclusive"
  const isTop = tier === "top"
  const isList = viewMode === "list"
  const formattedDate = formatDate(job.created_at)

  return (
    <article
      key={job.id}
      data-cy="job-card"
      className={cn(
        "cv-auto group relative bg-white transition",
        isList
          ? "border-b border-slate-100 px-4 py-4 last:border-b-0 hover:bg-[#fbfcf8] sm:px-5"
          : "min-h-[164px] rounded-xl border p-4 shadow-sm hover:-translate-y-0.5 hover:shadow-md",
        !isList && isExclusive && "border-amber-400 ring-1 ring-amber-100",
        !isList && isTop && "border-amber-300",
        !isList && !isExclusive && !isTop && "border-slate-200 hover:border-emerald-300",
        isList && isExclusive && "bg-amber-50/20",
        isList && isTop && "bg-amber-50/10",
      )}
    >
      {isList ? (
        <ListCardContent
          formattedDate={formattedDate}
          isExclusive={isExclusive}
          isSaved={isSaved}
          isTop={isTop}
          job={job}
          onToggleSave={onToggleSave}
        />
      ) : (
        <GridCardContent
          formattedDate={formattedDate}
          isExclusive={isExclusive}
          isSaved={isSaved}
          isTop={isTop}
          job={job}
          onToggleSave={onToggleSave}
        />
      )}
    </article>
  )
}

function GridCardContent({
  formattedDate,
  isExclusive,
  isSaved,
  isTop,
  job,
  onToggleSave,
}: {
  formattedDate: string
  isExclusive: boolean
  isSaved: boolean
  isTop: boolean
  job: Job
  onToggleSave: (jobId: Job["id"]) => void
}) {
  return (
    <>
      {(isTop || isExclusive) && (
        <div className={cn(
          "absolute right-0 top-0 rounded-bl-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white",
          isExclusive ? "bg-amber-600" : "bg-amber-500",
        )}>
          {isExclusive ? "Exclusive" : "TOP"}
        </div>
      )}

      <div className="flex items-start gap-3 mb-3">
        <CompanyAvatar isExclusive={isExclusive} isTop={isTop} job={job} />
        <div className="min-w-0 flex-1">
          <h2 className={(isTop || isExclusive) ? "pr-16" : undefined}>
            <Link
              href={getJobPath(job)}
              prefetch={false}
              data-cy="job-card-title"
              className="block line-clamp-2 text-left text-base font-semibold leading-snug text-slate-950 transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:text-[17px]"
            >
              {job.title}
            </Link>
          </h2>
          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
            <Building2 className="size-3 shrink-0" />
            <span className="truncate">{job.company}</span>
          </p>
        </div>
      </div>

      <SalarySummary job={job} compact />
      <JobTrustBadges job={job} compact />
      <JobTags job={job} />

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
          <Clock className="size-3" />
          {formattedDate}
        </span>
        <div className="flex items-center gap-2">
          <DetailLink job={job} compact />
          <SaveButton isSaved={isSaved} job={job} onToggleSave={onToggleSave} />
        </div>
      </div>
    </>
  )
}

function ListCardContent({
  formattedDate,
  isExclusive,
  isSaved,
  isTop,
  job,
  onToggleSave,
}: {
  formattedDate: string
  isExclusive: boolean
  isSaved: boolean
  isTop: boolean
  job: Job
  onToggleSave: (jobId: Job["id"]) => void
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_230px] lg:items-center">
      <div className="flex min-w-0 items-start gap-3">
        <CompanyAvatar isExclusive={isExclusive} isTop={isTop} job={job} />
        <div className="min-w-0">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            {(isTop || isExclusive) && (
              <span className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                isExclusive ? "bg-amber-100 text-amber-800" : "bg-amber-50 text-amber-800",
              )}>
                {isExclusive ? "Exclusive" : "TOP"}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
              <Clock className="size-3" />
              {formattedDate}
            </span>
          </div>
          <h2>
            <Link
              href={getJobPath(job)}
              prefetch={false}
              data-cy="job-card-title"
              className="block line-clamp-2 text-left text-lg font-semibold leading-snug text-slate-950 transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {job.title}
            </Link>
          </h2>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            <span className="inline-flex min-w-0 items-center gap-1">
              <Building2 className="size-3 shrink-0" />
              <span className="truncate">{job.company}</span>
            </span>
            {job.location && (
              <span className="inline-flex min-w-0 items-center gap-1">
                <MapPin className="size-3 shrink-0" />
                <span className="truncate">{job.location}</span>
              </span>
            )}
          </p>
          {job.description && (
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 line-clamp-2">
              {job.description}
            </p>
          )}
          <div className="mt-2">
            <JobTags job={job} />
          </div>
          <JobTrustBadges job={job} />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 lg:flex-col lg:items-end lg:justify-center">
        <SalarySummary job={job} />
        <div className="flex items-center gap-2">
          <DetailLink job={job} />
          <SaveButton isSaved={isSaved} job={job} onToggleSave={onToggleSave} />
        </div>
      </div>
    </div>
  )
}

function CompanyAvatar({
  isExclusive,
  isTop,
  job,
}: {
  isExclusive: boolean
  isTop: boolean
  job: Job
}) {
  return (
    <div
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-lg border text-xs font-bold",
        isExclusive
          ? "border-amber-200 bg-amber-100 text-amber-800"
          : isTop
            ? "border-amber-100 bg-amber-50 text-amber-800"
            : "border-slate-200 bg-slate-100 text-slate-600",
      )}
    >
          {(job.company?.[0] ?? job.title[0]).toUpperCase()}
    </div>
  )
}

function JobTags({ job }: { job: Job }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {job.country && (
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
          <div className={`flag flag-${job.country_code?.toLowerCase()}`} />
          {job.country.name}
        </span>
      )}
      <Badge variant="secondary" className="rounded-full bg-slate-100 text-[11px] font-medium text-slate-600 hover:bg-slate-100">
        {formatJobType(job.jobType)}
      </Badge>
      {(job.accommodation_provided || job.accommodation_paid) && (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-800">
          Ubytovanie
        </span>
      )}
    </div>
  )
}

function SalarySummary({ job, compact = false }: { job: Job; compact?: boolean }) {
  if (!job.salary) return null

  const salary = parseSalary(job.salary, job.salaryBasis)
  const details = salary
    ? `${formatSalaryUnit(salary.unitText)}, ${formatSalaryBasis(salary.basis)}`
    : "typ mzdy nešpecifikovaný"

  return (
    <div
      data-cy="salary-clarity"
      className={cn(
        compact ? "mb-2 rounded-lg bg-emerald-50 px-2.5 py-2 text-left" : "text-right",
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800">Mzda</p>
      <p className="mt-0.5 whitespace-nowrap text-sm font-semibold text-emerald-800">{job.salary}</p>
      <p className="mt-0.5 text-[11px] leading-snug text-emerald-800">{details}</p>
    </div>
  )
}

function JobTrustBadges({ job, compact = false }: { job: Job; compact?: boolean }) {
  const badges = getJobTrustBadges(job).slice(0, compact ? 2 : 3)

  return (
    <div className={cn("mt-2 flex flex-wrap gap-1.5", compact && "mb-2")}>
      {badges.map((badge) => (
        <TrustBadgePill key={badge.id} badge={badge} />
      ))}
    </div>
  )
}

function TrustBadgePill({ badge }: { badge: TrustBadge }) {
  const toneClass = {
    emerald: "bg-emerald-50 text-emerald-700",
    teal: "bg-emerald-50 text-emerald-800",
    amber: "bg-amber-50 text-amber-800",
    slate: "bg-slate-100 text-slate-600",
  }[badge.tone]

  return (
    <span
      data-cy="job-trust-badge"
      className={cn("inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium", toneClass)}
    >
      <ShieldCheck className="size-3" />
      {badge.label}
    </span>
  )
}

function DetailLink({ job, compact = false }: { job: Job; compact?: boolean }) {
  return (
    <Link
      href={getJobPath(job)}
      prefetch={false}
      data-cy="job-detail-link"
      onClick={(event) => event.stopPropagation()}
      className={cn(
        "inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        compact && "h-8 px-2.5",
      )}
    >
      Zobraziť ponuku
      <ChevronRight className="size-3.5" />
    </Link>
  )
}

function SaveButton({
  isSaved,
  job,
  onToggleSave,
}: {
  isSaved: boolean
  job: Job
  onToggleSave: (jobId: Job["id"]) => void
}) {
  return (
    <button
      aria-label={isSaved ? "Zrušiť uloženie ponuky" : "Uložiť ponuku"}
      aria-pressed={isSaved}
      data-cy="save-job-button"
      onClick={(event) => {
        event.stopPropagation()
        onToggleSave(job.id)
      }}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-md border transition-colors",
        isSaved
          ? "border-primary/20 bg-primary/10 text-primary"
          : "border-slate-200 bg-white text-slate-500 hover:border-primary/40 hover:text-primary",
      )}
    >
      {isSaved ? <Bookmark className="size-4 fill-current" /> : <BookmarkPlus className="size-4" />}
    </button>
  )
}

function formatDate(value: string) {
  return dateFormatter.format(new Date(value))
}
