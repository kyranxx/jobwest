"use client"

import React, { useState } from "react"
import { MultiSelect } from "@/components/ui/multi-select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RotateCcw, ChevronDown, Check } from "lucide-react"
import { europeanCountryCodes } from "@/lib/job-options"

interface QuickFiltersProps {
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
}

type CountryOptionProps = {
  country: { code: string; name: string; flag: string }
  selected: boolean
  onToggle: (code: string) => void
}

function CountryOption({ country, selected, onToggle }: CountryOptionProps) {
  return (
    <label
      onClick={() => onToggle(country.code)}
      className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-sm hover:bg-muted/50 transition-colors ${selected ? 'bg-primary/5 text-primary font-medium' : 'text-foreground'}`}
    >
      <div className={`h-3.5 w-3.5 rounded border flex items-center justify-center shrink-0 transition-colors ${selected ? 'bg-primary border-primary' : 'border-muted-foreground/30'}`}>
        {selected && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
      </div>
      <span className="truncate">{country.name}</span>
    </label>
  )
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
  accommodationNotProvided,
  setAccommodationNotProvided,
  resetFilters,
}: QuickFiltersProps) {
  const [countriesOpen, setCountriesOpen] = useState(false)

  const europeCountries = countries.filter((c) => europeanCountryCodes.has(c.code))
  const outsideEurope = countries.filter((c) => !europeanCountryCodes.has(c.code))
  const toggleCountry = (code: string) => {
    setSelectedCountries((prev) => prev.includes(code) ? prev.filter((x) => x !== code) : [...prev, code])
  }

  const toggleJobType = (id: string) => {
    setSelectedJobTypes((prev) =>
      prev.includes(id) ? prev.filter((jt) => jt !== id) : [...prev, id]
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
          Pracovná pozícia
        </Label>
        <MultiSelect
          id="work-position"
          name="work-position"
          options={categories}
          selected={selectedCategories}
          onChange={setSelectedCategories}
          placeholder="Všetky pozície"
          className="w-full"
        />
      </div>

      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
          Krajina
        </Label>
        <div className="space-y-1 border rounded-lg p-2">
          <button
            type="button"
            className="flex items-center justify-between w-full px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground"
            onClick={() => setCountriesOpen(!countriesOpen)}
          >
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${selectedCountries.length > 0 ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
              {selectedCountries.length > 0
                ? `${selectedCountries.length} vybratých`
                : "Všetky krajiny"}
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${countriesOpen ? 'rotate-180' : ''}`} />
          </button>
          {countriesOpen && (
            <div className="pt-1 space-y-2 animate-fade-in">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase px-2 pt-1">Európa</p>
              <div className="grid grid-cols-2 gap-0.5 px-1">
                {europeCountries.map((c) => (
                  <CountryOption
                    key={c.code}
                    country={c}
                    selected={selectedCountries.includes(c.code)}
                    onToggle={toggleCountry}
                  />
                ))}
              </div>
              {outsideEurope.length > 0 && (
                <>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase px-2 pt-2">Mimo Európy</p>
                  <div className="grid grid-cols-2 gap-0.5 px-1">
                    {outsideEurope.map((c) => (
                      <CountryOption
                        key={c.code}
                        country={c}
                        selected={selectedCountries.includes(c.code)}
                        onToggle={toggleCountry}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
          Druh práce
        </Label>
        <div className="flex flex-wrap gap-1.5">
          {jobTypes.map((jt) => (
            <button
              key={jt.id}
              type="button"
              onClick={() => toggleJobType(jt.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${selectedJobTypes.includes(jt.id) ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-input hover:border-primary/50 hover:text-foreground'}`}
            >
              <div className={`h-3.5 w-3.5 rounded border flex items-center justify-center shrink-0 transition-colors ${selectedJobTypes.includes(jt.id) ? 'bg-primary-foreground/20 border-transparent' : 'border-muted-foreground/30'}`}>
                {selectedJobTypes.includes(jt.id) && (
                  <Check className="h-2.5 w-2.5 text-current" strokeWidth={3} />
                )}
              </div>
              {jt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
          Ubytovanie
        </Label>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setAccommodationNotProvided(!accommodationNotProvided)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${accommodationNotProvided ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-input hover:border-primary/50 hover:text-foreground'}`}
          >
            <div className={`h-3.5 w-3.5 rounded border flex items-center justify-center shrink-0 transition-colors ${accommodationNotProvided ? 'bg-primary-foreground/20 border-transparent' : 'border-muted-foreground/30'}`}>
              {accommodationNotProvided && (
                <Check className="h-2.5 w-2.5 text-current" strokeWidth={3} />
              )}
            </div>
            Nezabezpečené / nehradené
          </button>
        </div>
      </div>

      <Button
        variant="outline"
        onClick={resetFilters}
        className="w-full text-muted-foreground hover:text-foreground"
      >
        <RotateCcw className="h-4 w-4 mr-2" />
        Resetovať filtre
      </Button>
    </div>
  )
}
