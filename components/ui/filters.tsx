"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MultiSelect } from "@/components/ui/multi-select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RotateCcw, Search, X, ListFilter, LayoutGrid } from "lucide-react"

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
  return (
    <div className="space-y-3 p-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-medium">
          {filteredJobsCount} {getOfferText(filteredJobsCount)}
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="icon"
            className="rounded-full h-8 w-8 bg-black hover:bg-gray-800"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            title={viewMode === 'grid' ? "Zobraziť zoznam" : "Zobraziť mriežku"}
          >
            {viewMode === 'grid' ? <ListFilter className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
            <span className="sr-only">{viewMode === 'grid' ? "Zobraziť zoznam" : "Zobraziť mriežku"}</span>
          </Button>
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold">Pracovná pozícia</h3>
        <MultiSelect
          options={categories}
          selected={selectedCategories}
          onChange={setSelectedCategories}
          placeholder="Všetky pozície"
          className="w-full h-9 text-sm"
        />
        <div className="flex flex-wrap gap-1 pt-1">
          {selectedCategories.map((category) => (
            <Badge key={category} variant="secondary" className="flex items-center gap-1 capitalize text-xs py-0.5 px-2 rounded-full">
              {category}
              <button onClick={() => setSelectedCategories(selectedCategories.filter(item => item !== category))} className="rounded-full hover:bg-gray-300 p-0.5">
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          ))}
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold">Krajina</h3>
        <MultiSelect
          options={countries.map(c => ({ value: c.code, label: c.name, flag: c.flag }))}
          selected={selectedCountries}
          onChange={setSelectedCountries}
          placeholder="Všetky krajiny"
          className="w-full h-9 text-sm"
        />
        <div className="flex flex-wrap gap-1 pt-1">
          {selectedCountries.map((countryCode) => {
            const country = countries.find(c => c.code === countryCode);
            return (
              <Badge key={countryCode} variant="secondary" className="flex items-center gap-1 text-xs py-0.5 px-2 rounded-full">
                {country && <div className={`flag flag-${country.flag} shrink-0`} />}
                {country?.name}
                <button onClick={() => setSelectedCountries(selectedCountries.filter(item => item !== countryCode))} className="ml-1 rounded-full hover:bg-gray-300 p-0.5">
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            )
          })}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-2">Typ práce</h3>
        <div className="space-y-2">
          {jobTypes.map((type, index) => (
            <div key={`${type.id}-${index}`} className="flex items-center space-x-2">
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
                className="h-4 w-4"
              />
              <Label htmlFor={`job-type-${type.id}`} className="text-sm font-normal">
                {type.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-2">Ubytovanie</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="accommodation-provided"
              checked={isAccommodationProvided}
              onCheckedChange={(checked) => setIsAccommodationProvided(Boolean(checked))}
              className="h-4 w-4"
            />
            <Label htmlFor="accommodation-provided" className="text-sm font-normal">
              Zabezpečené
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="accommodation-paid"
              checked={isAccommodationPaid}
              onCheckedChange={(checked) => setIsAccommodationPaid(Boolean(checked))}
              className="h-4 w-4"
            />
            <Label htmlFor="accommodation-paid" className="text-sm font-normal">
              Hradené
            </Label>
          </div>
        </div>
      </div>
      <div className="pt-2">
        <Button
          variant="default"
          size="sm"
          className="w-full text-sm bg-black hover:bg-gray-800"
          onClick={resetFilters}
        >
          <RotateCcw className="h-3 w-3 mr-2" />
          Resetovať filtre
        </Button>
      </div>
    </div>
  )
}
