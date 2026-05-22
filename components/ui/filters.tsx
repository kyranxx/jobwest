"use client"

import React from "react"
import { QuickFilters } from "@/components/ui/quick-filters"
import { Button } from "@/components/ui/button"
import { LayoutGrid, Rows3 } from "@/components/ui/icons"
import type { HighlightTier } from "@/lib/types"

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
  selectedLanguages: string[]
  setSelectedLanguages: (languages: string[] | ((prev: string[]) => string[])) => void
  languageOptions: readonly { id: string; label: string }[]
  selectedHighlightTiers: HighlightTier[]
  setSelectedHighlightTiers: (tiers: HighlightTier[] | ((prev: HighlightTier[]) => HighlightTier[])) => void
  highlightOptions: readonly { id: HighlightTier; label: string }[]
  accommodationProvided: boolean
  setAccommodationProvided: (v: boolean) => void
  minSalary: string
  setMinSalary: (value: string) => void
  salaryCurrency: string
  setSalaryCurrency: (value: string) => void
  salaryCurrencies: readonly { id: string; label: string }[]
  resetFilters: () => void
  filteredJobsCount: number
  viewMode: "grid" | "list"
  setViewMode: (viewMode: "grid" | "list") => void
  onFilterCommit?: (message: string) => void
  onViewModeChange?: (message: string) => void
}

export function Filters({
  filteredJobsCount,
  viewMode,
  setViewMode,
  onFilterCommit,
  onViewModeChange,
  ...props
}: FiltersProps) {
  const getOfferText = (count: number) => {
    if (count === 1) return "ponuka"
    if (count >= 2 && count <= 4) return "ponuky"
    return "ponúk"
  }

  return (
    <div className="hidden w-64 shrink-0 md:block xl:w-72">
      <div className="sticky top-20 rounded-lg border border-[#ded9df] bg-white p-4 shadow-[0_14px_44px_rgba(36,16,51,0.04)]">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <span className="text-xl font-semibold text-slate-950">{filteredJobsCount}</span>
            <span className="text-xs text-slate-500 ml-1">{getOfferText(filteredJobsCount)}</span>
          </div>
          <div className="flex items-center gap-0.5 rounded-md bg-emerald-50 p-0.5">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              className="size-7 rounded-md"
              onClick={() => {
                setViewMode("grid")
                onViewModeChange?.("Zobrazenie prepnuté na mriežku")
              }}
              aria-label="Mriežka"
            >
              <LayoutGrid className="size-3.5" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              className="size-7 rounded-md"
              onClick={() => {
                setViewMode("list")
                onViewModeChange?.("Zobrazenie prepnuté na zoznam")
              }}
              aria-label="Zoznam"
            >
              <Rows3 className="size-3.5" />
            </Button>
          </div>
        </div>
        <QuickFilters {...props} idPrefix="desktop" onFilterCommit={onFilterCommit} />
      </div>
    </div>
  )
}
