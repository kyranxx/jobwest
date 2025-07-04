"use client"

import React from "react"
import { MultiSelect } from "@/components/ui/multi-select"

interface QuickFiltersProps {
  selectedCategories: string[]
  setSelectedCategories: (categories: string[]) => void
  categories: { value: string; label: string }[]
  selectedCountries: string[]
  setSelectedCountries: (countries: string[]) => void
  countries: { code: string; name: string; flag: string }[]
  selectedJobTypes: string[]
  setSelectedJobTypes: (jobTypes: string[]) => void
  jobTypes: { id: string; label: string }[]
}

export function QuickFilters({
  selectedCategories,
  setSelectedCategories,
  categories,
  selectedCountries,
  setSelectedCountries,
  countries,
  selectedJobTypes,
  setSelectedJobTypes,
  jobTypes,
}: QuickFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Pracovná pozícia
        </label>
        <MultiSelect
          options={categories}
          selected={selectedCategories}
          onChange={setSelectedCategories}
          placeholder="Všetky pozície"
          className="w-full"
        />
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Krajina
        </label>
        <MultiSelect
          options={countries.map((c) => ({
            value: c.code,
            label: c.name,
            flag: c.flag,
          }))}
          selected={selectedCountries}
          onChange={setSelectedCountries}
          placeholder="Všetky krajiny"
          className="w-full"
        />
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Typ práce
        </label>
        <MultiSelect
          options={jobTypes.map((jt) => ({
            value: jt.id,
            label: jt.label,
          }))}
          selected={selectedJobTypes}
          onChange={setSelectedJobTypes}
          placeholder="Všetky typy"
          className="w-full"
        />
      </div>
    </div>
  )
}
