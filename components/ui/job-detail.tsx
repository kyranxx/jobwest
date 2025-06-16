"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"

// Define the type for a single job based on the existing data structure
type Job = {
  id: number
  title: string
  country: {
    code: string
    name: string
  }
  category: string
  jobType: string
  salary: string
  isTop: boolean
  // Add a description field for the detail view
  description?: string
}

interface JobDetailProps {
  job: Job
  onBack: () => void
}

export default function JobDetail({ job, onBack }: JobDetailProps) {
  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Späť na zoznam
      </Button>
      <div className="flex items-center gap-4 mb-4">
        <h2 className="text-2xl font-bold">{job.title}</h2>
        {job.isTop && (
          <Badge className="bg-black text-white text-xs font-medium px-2 py-0.5 pointer-events-none">
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
        <div className="flex items-center gap-2">
          <div className={`flag flag-${job.country.code}`} />
          <span>{job.country.name}</span>
        </div>
      </div>
      <p className="text-lg font-semibold mt-2 mb-4">{job.salary}</p>
      <div className="prose max-w-none">
        <p>
          {job.description ||
            "Tu bude podrobný popis pracovnej ponuky. Zatiaľ je tu len placeholder text, pretože v pôvodných dátach nebol žiadny popis. V reálnej aplikácii by sa tu načítal celý text inzerátu."}
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
          consequat.
        </p>
      </div>
      <Button size="lg" className="mt-6 w-full sm:w-auto">
        Požiadať o túto prácu
      </Button>
    </div>
  )
}
