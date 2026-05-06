"use client"

import React from "react"
import { QuickFilters } from "@/components/ui/quick-filters"
import { Button } from "@/components/ui/button"
import { LayoutGrid, Rows3 } from "@/components/ui/icons"

interface FiltersProps {
  selectedCategories: string[]
  setSelectedCategories: (categories: string[] | ((prev: string[]) => string[])) => void
  categories: { value: string; label: string }[]
  selectedCountries: string[]
  setSelectedCountries: (countries: string[] | ((prev: string[]) => string[])) => void
  countries: { code: string; name: string; flag: string }[]
  selectedJobTypes: string[]
  setSelectedJobTypes: (jobTypes: string[] | ((prev: string[]) => string[])) => void
  jobTypes: readonly { id: string; label: string }[]
  accommodationNotProvided: boolean
  setAccommodationNotProvided: (v: boolean) => void
  resetFilters: () => void
  filteredJobsCount: number
  viewMode: "grid" | "list"
  setViewMode: (viewMode: "grid" | "list") => void
}

export function Filters({
  filteredJobsCount,
  viewMode,
  setViewMode,
  ...props
}: FiltersProps) {
  const getOfferText = (count: number) => {
    if (count === 1) return "ponuka"
    if (count >= 2 && count <= 4) return "ponuky"
    return "ponúk"
  }

  return (
    <div className="hidden md:block w-64 shrink-0">
      <div className="sticky top-20 rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-lg font-bold text-foreground">{filteredJobsCount}</span>
            <span className="text-xs text-muted-foreground ml-1">{getOfferText(filteredJobsCount)}</span>
          </div>
          <div className="flex items-center gap-0.5 bg-muted rounded-md p-0.5">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              className="h-7 w-7 rounded-sm"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              className="h-7 w-7 rounded-sm"
              onClick={() => setViewMode("list")}
            >
              <Rows3 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <QuickFilters {...props} />
      </div>
    </div>
  )
}
