"use client"

import React from "react"
import { MultiSelect } from "@/components/ui/multi-select"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RotateCcw } from "lucide-react"

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
  isAccommodationProvided: boolean
  setIsAccommodationProvided: (isProvided: boolean) => void
  isAccommodationPaid: boolean
  setIsAccommodationPaid: (isPaid: boolean) => void
  resetFilters: () => void
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
  isAccommodationProvided,
  setIsAccommodationProvided,
  isAccommodationPaid,
  setIsAccommodationPaid,
  resetFilters,
}: QuickFiltersProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="w-full">
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
      <div className="w-full">
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
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Druh práce
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
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="accommodation-provided"
            checked={isAccommodationProvided}
            onCheckedChange={(checked) => setIsAccommodationProvided(Boolean(checked))}
          />
          <Label htmlFor="accommodation-provided">Ubytovanie zabezpečené</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="accommodation-paid"
            checked={isAccommodationPaid}
            onCheckedChange={(checked) => setIsAccommodationPaid(Boolean(checked))}
          />
          <Label htmlFor="accommodation-paid">Ubytovanie hradené</Label>
        </div>
      </div>
      <Button
        variant="default"
        onClick={resetFilters}
        className="w-full bg-black text-white hover:bg-dark-gray-800"
      >
        <RotateCcw className="h-4 w-4 mr-2" />
        Resetovať
      </Button>
    </div>
  )
}
