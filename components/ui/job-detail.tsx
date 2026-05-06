"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, Briefcase, Home, Building2 } from "./icons"
import { Job, getHighlightTier } from "@/lib/types"

interface JobDetailProps {
  job: Job
  onBack: () => void
}

export default function JobDetail({ job, onBack }: JobDetailProps) {
  const tier = getHighlightTier(job)
  const isExclusive = tier === "exclusive"
  const isTop = tier === "top"

  return (
    <div>
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        Späť na zoznam ponúk
      </Button>

      <div className={`rounded-lg border bg-card overflow-hidden ${isExclusive ? "ring-1 ring-amber-400" : isTop ? "ring-1 ring-blue-300" : ""}`}>
        <div className={`p-5 md:p-6 ${isExclusive ? "bg-amber-50/50" : isTop ? "bg-blue-50/30" : "bg-muted/20"}`}>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className={`h-12 w-12 rounded-lg flex items-center justify-center shrink-0 text-lg font-bold ${isExclusive ? "bg-amber-100 text-amber-700" : isTop ? "bg-blue-100 text-blue-700" : "bg-muted text-muted-foreground"}`}>
                {(job.company?.[0] ?? job.title[0]).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl md:text-2xl font-bold">{job.title}</h2>
                  {(isTop || isExclusive) && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isExclusive ? "bg-amber-500 text-white" : "bg-blue-600 text-white"}`}>
                      {isExclusive ? "Exclusive" : "TOP"}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground text-sm flex items-center gap-1 mt-0.5">
                  <Building2 className="h-3.5 w-3.5" />
                  {job.company}
                </p>
              </div>
            </div>
            {job.salary && (
              <div className="shrink-0">
                <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-base">
                  {job.salary}
                </span>
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
              <Briefcase className="h-3 w-3" />
              {job.jobType}
            </Badge>
            <Badge variant="outline" className="rounded">
              {job.category}
            </Badge>
            {job.accommodation_provided && (
              <Badge className="bg-violet-50 text-violet-700 border-0 rounded gap-1">
                <Home className="h-3 w-3" />
                Ubytovanie zabezpečené
              </Badge>
            )}
            {job.accommodation_paid && (
              <Badge className="bg-green-50 text-green-700 border-0 rounded gap-1">
                Ubytovanie hradené
              </Badge>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2">Popis ponuky</h3>
            <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {job.description}
            </div>
          </div>

          {(job.accommodation_provided || job.accommodation_paid) && (
            <div className="rounded-lg border bg-muted/20 p-4">
              <h3 className="text-sm font-semibold mb-2">Benefity</h3>
              <div className="space-y-1.5">
                {job.accommodation_provided && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-1.5 w-1.5 rounded-full bg-violet-500 shrink-0" />
                    Ubytovanie <span className="font-medium text-foreground">zabezpečené</span>
                  </div>
                )}
                {job.accommodation_paid && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
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
              <p className="text-sm text-muted-foreground">Kontaktné informácie nie sú k dispozícii.</p>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
            <Clock className="h-3 w-3" />
            Uverejnené: {new Date(job.created_at).toLocaleDateString("sk-SK")}
          </div>
        </div>
      </div>
    </div>
  )
}
