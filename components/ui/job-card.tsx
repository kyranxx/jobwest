"use client"

import { BookmarkPlus, Bookmark, Clock, Building2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Job, getHighlightTier } from "@/lib/types"

interface JobCardProps {
  job: Job
  isSaved: boolean
  onSelect: (job: Job) => void
  onToggleSave: (jobId: Job["id"]) => void
}

export function JobCard({ job, isSaved, onSelect, onToggleSave }: JobCardProps) {
  const tier = getHighlightTier(job)
  const isExclusive = tier === "exclusive"
  const isTop = tier === "top"

  return (
    <div
      key={job.id}
      className={`group relative rounded-lg border bg-card p-4 cursor-pointer transition-shadow hover:shadow-md ${isExclusive ? "border-amber-400 ring-1 ring-amber-200" : isTop ? "border-blue-300" : "hover:border-primary/40"}`}
      onClick={() => onSelect(job)}
    >
      {(isTop || isExclusive) && (
        <div className={`absolute top-0 right-0 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-bl-lg ${isExclusive ? "bg-amber-500 text-white" : "bg-blue-600 text-white"}`}>
          {isExclusive ? "Exclusive" : "TOP"}
        </div>
      )}

      <div className="flex items-start gap-2.5 mb-2">
        <div className={`h-9 w-9 rounded-md flex items-center justify-center shrink-0 text-xs font-bold ${isExclusive ? "bg-amber-100 text-amber-700" : isTop ? "bg-blue-50 text-blue-700" : "bg-muted text-muted-foreground"}`}>
          {(job.company?.[0] ?? job.title[0]).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className={`font-semibold text-sm leading-tight line-clamp-2 ${isTop || isExclusive ? "pr-14" : ""}`}>
            {job.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
            <Building2 className="h-3 w-3 shrink-0" />
            <span className="truncate">{job.company}</span>
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 mt-auto">
        {job.country && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted text-[11px] text-muted-foreground">
            <div className={`flag flag-${job.country_code?.toLowerCase()}`} />
            {job.country.name}
          </span>
        )}
        <Badge variant="secondary" className="text-[11px] font-normal rounded">
          {job.jobType}
        </Badge>
        {job.salary && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-[11px] font-medium text-emerald-700">
            {job.salary}
          </span>
        )}
        {(job.accommodation_provided || job.accommodation_paid) && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-violet-50 text-[11px] font-medium text-violet-700">
            Ubytovanie
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t">
        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <Clock className="h-3 w-3" />
          {new Date(job.created_at).toLocaleDateString("sk-SK")}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleSave(job.id) }}
          className={`p-1 rounded transition-colors ${isSaved ? "text-primary" : "text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-primary"}`}
        >
          {isSaved ? <Bookmark className="h-4 w-4 fill-current" /> : <BookmarkPlus className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}