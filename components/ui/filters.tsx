"use client"

import React from "react"
import { QuickFilters } from "@/components/ui/quick-filters"
import { Button } from "@/components/ui/button"
import { LayoutGrid, Rows3 } from "lucide-react"

interface FiltersProps {
  selectedCategories: string[]
  setSelectedCategories: (categories: string[]) => void
  categories: { value: string; label: string }[]
  selectedCountries: string[]
  setSelectedCountries: (countries: string[]) => void
  countries: { code: string; name: string; flag: string }[]
  selectedJobTypes: string[]
  setSelectedJobTypes: (jobTypes: string[]) => void
  jobTypes: { id: string; label: string }[]
  isAccommodationProvided: boolean
  setIsAccommodationProvided: (isProvided: boolean) => void
  isAccommodationPaid: boolean
  setIsAccommodationPaid: (isPaid: boolean) => void
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
    <div className="hidden md:block w-64 p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-md font-semibold">
          {filteredJobsCount} {getOfferText(filteredJobsCount)}
        </h3>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          className="bg-black text-white hover:bg-gray-800"
        >
          {viewMode === "grid" ? (
            <Rows3 className="h-5 w-5" />
          ) : (
            <LayoutGrid className="h-5 w-5" />
          )}
        </Button>
      </div>
      <QuickFilters {...props} />
    </div>
  )
}
