"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { MultiSelect } from "@/components/ui/multi-select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RotateCcw, X, LayoutGrid, ListFilter } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

interface FiltersProps {
  filteredJobsCount: number
  getOfferText: (count: number) => string
  viewMode: "grid" | "list"
  setViewMode: (viewMode: "grid" | "list") => void
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

export function Filters({
  filteredJobsCount,
  getOfferText,
  viewMode,
  setViewMode,
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
}: FiltersProps) {
  const isMobile = useIsMobile()

  return (
    <div className="space-y-6 p-4">
      {!isMobile && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Zobrazenie</h3>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "grid" ? "secondary" : "outline"}
              onClick={() => setViewMode("grid")}
              className="flex-1"
            >
              <LayoutGrid className="h-5 w-5 mr-2" />
              Grid
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "outline"}
              onClick={() => setViewMode("list")}
              className="flex-1"
            >
              <ListFilter className="h-5 w-5 mr-2" />
              List
            </Button>
          </div>
        </div>
      )}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Pracovná pozícia</h3>
        <MultiSelect
          options={categories}
          selected={selectedCategories}
          onChange={setSelectedCategories}
          placeholder="Všetky pozície"
          className="w-full h-10 text-base"
        />
        <div className="flex flex-wrap gap-2 pt-2">
          {selectedCategories.map((category) => (
            <Badge key={category} variant="secondary" className="flex items-center gap-1 capitalize text-sm py-1 px-3 rounded-full">
              {category}
              <button onClick={() => setSelectedCategories(selectedCategories.filter(item => item !== category))} className="rounded-full hover:bg-gray-300 p-0.5">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Krajina</h3>
        <MultiSelect
          options={countries.map(c => ({ value: c.code, label: c.name, flag: c.flag }))}
          selected={selectedCountries}
          onChange={setSelectedCountries}
          placeholder="Všetky krajiny"
          className="w-full h-10 text-base"
        />
        <div className="flex flex-wrap gap-2 pt-2">
          {selectedCountries.map((countryCode) => {
            const country = countries.find(c => c.code === countryCode);
            return (
              <Badge key={countryCode} variant="secondary" className="flex items-center gap-2 text-sm py-1 px-3 rounded-full">
                {country && <div className={`flag flag-${country.flag} shrink-0`} />}
                {country?.name}
                <button onClick={() => setSelectedCountries(selectedCountries.filter(item => item !== countryCode))} className="ml-1 rounded-full hover:bg-gray-300 p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )
          })}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-3">Typ práce</h3>
        <div className="space-y-3">
          {jobTypes.map((type, index) => (
            <div key={`${type.id}-${index}`} className="flex items-center space-x-3">
              <Checkbox
                id={`job-type-${type.id}`}
                checked={selectedJobTypes.includes(type.id)}
                onCheckedChange={(checked) => {
                  setSelectedJobTypes(
                    checked
                      ? [...selectedJobTypes, type.id]
                      : selectedJobTypes.filter(item => item !== type.id)
                  )
                }}
                className="h-5 w-5"
              />
              <Label htmlFor={`job-type-${type.id}`} className="text-base font-normal">
                {type.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-3">Ubytovanie</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="accommodation-provided"
              checked={isAccommodationProvided}
              onCheckedChange={(checked) => setIsAccommodationProvided(Boolean(checked))}
              className="h-5 w-5"
            />
            <Label htmlFor="accommodation-provided" className="text-base font-normal">
              Zabezpečené
            </Label>
          </div>
          <div className="flex items-center space-x-3">
            <Checkbox
              id="accommodation-paid"
              checked={isAccommodationPaid}
              onCheckedChange={(checked) => setIsAccommodationPaid(Boolean(checked))}
              className="h-5 w-5"
            />
            <Label htmlFor="accommodation-paid" className="text-base font-normal">
              Hradené
            </Label>
          </div>
        </div>
      </div>
      <div className="pt-4 space-y-3">
        <Button
          variant="outline"
          size="lg"
          className="w-full text-base"
          onClick={resetFilters}
        >
          <RotateCcw className="h-5 w-5 mr-2" />
          Resetovať všetky filtre
        </Button>
        <Button
          variant="default"
          size="lg"
          className="w-full text-base bg-black hover:bg-gray-800"
        >
          Filtrovať
        </Button>
      </div>
    </div>
  )
}
