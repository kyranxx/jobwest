"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import { Job } from "@/lib/types"

interface JobDetailProps {
  job: Job
  onBack: () => void
}

export default function JobDetail({ job, onBack }: JobDetailProps) {
  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-4 sm:p-6">
      <Button variant="ghost" onClick={onBack} className="mb-4 -ml-4 sm:ml-0">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Späť na zoznam
      </Button>
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 mb-4">
        <h2 className="text-xl sm:text-2xl font-bold">{job.title}</h2>
        {job.isTop && (
          <Badge className="bg-black text-white text-xs font-medium px-2 py-0.5 rounded-sm mt-2 sm:mt-0 self-start">
            TOP
          </Badge>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2 mt-2 mb-4">
        <Badge variant="outline" className="text-sm px-3 py-1 rounded-md bg-gray-50">
          {job.jobType}
        </Badge>
        <Badge variant="outline" className="text-sm px-3 py-1 rounded-md bg-gray-50">
          {job.category}
        </Badge>
        {job.country && (
          <div className="flex items-center gap-2">
            <div className={`flag flag-${job.country.code}`} />
            <span className="text-sm">{job.country.name}</span>
          </div>
        )}
      </div>
      <p className="text-lg font-semibold mt-4 mb-4">{job.salary}</p>
      <div className="prose max-w-none text-base">
        <p>{job.description}</p>
      </div>
      <div className="mt-6 space-y-3">
        {job.accommodation_provided && (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">Ubytovanie zabezpečené:</span>
            <span className="text-sm">Áno</span>
          </div>
        )}
        {job.accommodation_paid && (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">Ubytovanie hradené:</span>
            <span className="text-sm">Áno</span>
          </div>
        )}
      </div>
      <Button size="lg" className="mt-6 w-full sm:w-auto text-base">
        Požiadať o túto prácu
      </Button>
    </div>
  )
}
