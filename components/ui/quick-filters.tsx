"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RotateCcw, ChevronDown, Check } from "lucide-react"
import { europeanCountryCodes } from "@/lib/job-options"
import type { HighlightTier } from "@/lib/types"

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
  idPrefix?: string
  onFilterCommit?: (message: string) => void
}

type CountryOptionProps = {
  country: { code: string; name: string; flag: string }
  selected: boolean
  onToggle: (code: string) => void
}

function CountryOption({ country, selected, onToggle }: CountryOptionProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(country.code)}
      className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted/50 ${selected ? 'bg-primary/5 text-primary font-medium' : 'text-foreground'}`}
    >
      <div className={`size-3.5 rounded border flex items-center justify-center shrink-0 transition-colors ${selected ? 'bg-primary border-primary' : 'border-muted-foreground/30'}`}>
        {selected && <Check className="size-2.5 text-white" strokeWidth={3} />}
      </div>
      <span className="truncate">{country.name}</span>
    </button>
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
  selectedLanguages,
  setSelectedLanguages,
  languageOptions,
  selectedHighlightTiers,
  setSelectedHighlightTiers,
  highlightOptions,
  accommodationProvided,
  setAccommodationProvided,
  minSalary,
  setMinSalary,
  salaryCurrency,
  setSalaryCurrency,
  salaryCurrencies,
  resetFilters,
  idPrefix = "filters",
  onFilterCommit,
}: QuickFiltersProps) {
  const [countriesOpen, setCountriesOpen] = useState(false)
  const positionId = `${idPrefix}-work-position`
  const salaryMinId = `${idPrefix}-salary-min-filter`
  const salaryCurrencyId = `${idPrefix}-salary-currency-filter`

  const europeCountries = countries.filter((c) => europeanCountryCodes.has(c.code))
  const outsideEurope = countries.filter((c) => !europeanCountryCodes.has(c.code))
  const toggleCountry = (code: string) => {
    setSelectedCountries((prev) => prev.includes(code) ? prev.filter((x) => x !== code) : [...prev, code])
    onFilterCommit?.("Filter krajiny bol použitý")
  }

  const toggleJobType = (id: string) => {
    setSelectedJobTypes((prev) =>
      prev.includes(id) ? prev.filter((jt) => jt !== id) : [...prev, id]
    )
    onFilterCommit?.("Filter typu práce bol použitý")
  }

  const toggleLanguage = (id: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(id) ? prev.filter((language) => language !== id) : [...prev, id]
    )
    onFilterCommit?.("Filter jazyka bol použitý")
  }

  const toggleHighlightTier = (id: HighlightTier) => {
    setSelectedHighlightTiers((prev) =>
      prev.includes(id) ? prev.filter((tier) => tier !== id) : [...prev, id]
    )
    onFilterCommit?.("Filter zvýraznenia bol použitý")
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Label htmlFor={positionId} className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Pracovná pozícia
        </Label>
        <select
          id={positionId}
          name={positionId}
          value={selectedCategories[0] ?? "all"}
          onChange={(event) => {
            const value = event.target.value
            setSelectedCategories(value === "all" ? [] : [value])
            onFilterCommit?.("Filter pozície bol použitý")
          }}
          className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-primary focus:ring-4 focus:ring-emerald-100"
        >
          <option value="all">Všetky pozície</option>
          {categories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Krajina
        </Label>
        <div className="space-y-1 rounded-lg border border-slate-200 bg-slate-50/40 p-1.5">
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm text-slate-600 hover:bg-white hover:text-slate-950"
            onClick={() => setCountriesOpen(!countriesOpen)}
          >
            <div className="flex items-center gap-2">
              <span className={`size-2 rounded-full ${selectedCountries.length > 0 ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
              {selectedCountries.length > 0
                ? `${selectedCountries.length} vybratých`
                : "Všetky krajiny"}
            </div>
            <ChevronDown className={`size-4 transition-transform ${countriesOpen ? 'rotate-180' : ''}`} />
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
        <Label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Druh práce
        </Label>
        <div className="flex flex-wrap gap-1.5">
          {jobTypes.map((jt) => (
            <button
              key={jt.id}
              type="button"
              onClick={() => toggleJobType(jt.id)}
              className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-sm font-medium transition-colors ${selectedJobTypes.includes(jt.id) ? 'border-primary bg-primary text-primary-foreground' : 'border-slate-200 bg-white text-slate-600 hover:border-primary/50 hover:text-slate-950'}`}
            >
              <div className={`size-3.5 rounded border flex items-center justify-center shrink-0 transition-colors ${selectedJobTypes.includes(jt.id) ? 'bg-primary-foreground/20 border-transparent' : 'border-muted-foreground/30'}`}>
                {selectedJobTypes.includes(jt.id) && (
                  <Check className="size-2.5 text-current" strokeWidth={3} />
                )}
              </div>
              {jt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor={salaryMinId} className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Mzda
        </Label>
        <div className="grid grid-cols-[minmax(0,1fr)_92px] gap-2">
          <input
            id={salaryMinId}
            name={salaryMinId}
            data-cy="salary-min-filter"
            inputMode="numeric"
            value={minSalary}
            onChange={(event) => setMinSalary(event.target.value)}
            placeholder="Min. mzda"
            className="h-9 min-w-0 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-primary focus:ring-4 focus:ring-emerald-100"
          />
          <select
            id={salaryCurrencyId}
            name={salaryCurrencyId}
            value={salaryCurrency}
            onChange={(event) => {
              setSalaryCurrency(event.target.value)
              onFilterCommit?.("Mena mzdy bola upravená")
            }}
            className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm font-medium text-slate-700 outline-none transition focus:border-primary focus:ring-4 focus:ring-emerald-100"
            aria-label="Mena mzdy"
          >
            {salaryCurrencies.map((currency) => (
              <option key={currency.id} value={currency.id}>{currency.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <Label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Jazyk
        </Label>
        <div className="flex flex-wrap gap-1.5">
          {languageOptions.map((language) => (
            <ToggleButton
              key={language.id}
              active={selectedLanguages.includes(language.id)}
              dataCy={`language-filter-${language.id}`}
              label={language.label}
              onClick={() => toggleLanguage(language.id)}
            />
          ))}
        </div>
      </div>

      <div>
        <Label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Zvýraznenie
        </Label>
        <div className="flex flex-wrap gap-1.5">
          {highlightOptions.map((highlight) => (
            <ToggleButton
              key={highlight.id}
              active={selectedHighlightTiers.includes(highlight.id)}
              dataCy={`highlight-filter-${highlight.id}`}
              label={highlight.label}
              onClick={() => toggleHighlightTier(highlight.id)}
            />
          ))}
        </div>
      </div>

      <div>
        <Label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Ubytovanie
        </Label>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            data-cy="accommodation-filter"
            onClick={() => {
              setAccommodationProvided(!accommodationProvided)
              onFilterCommit?.("Filter ubytovania bol použitý")
            }}
            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-sm font-medium transition-colors ${accommodationProvided ? 'border-primary bg-primary text-primary-foreground' : 'border-slate-200 bg-white text-slate-600 hover:border-primary/50 hover:text-slate-950'}`}
          >
            <div className={`size-3.5 rounded border flex items-center justify-center shrink-0 transition-colors ${accommodationProvided ? 'bg-primary-foreground/20 border-transparent' : 'border-muted-foreground/30'}`}>
              {accommodationProvided && (
                <Check className="size-2.5 text-current" strokeWidth={3} />
              )}
            </div>
            S ubytovaním
          </button>
        </div>
      </div>

      <Button
        variant="outline"
        onClick={() => {
          resetFilters()
          onFilterCommit?.("Filtre boli resetované")
        }}
        className="h-9 w-full text-slate-500 hover:text-slate-950"
      >
        <RotateCcw className="size-4 mr-2" />
        Resetovať filtre
      </Button>
    </div>
  )
}

function ToggleButton({
  active,
  dataCy,
  label,
  onClick,
}: {
  active: boolean
  dataCy: string
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      data-cy={dataCy}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-sm font-medium transition-colors ${active ? 'border-primary bg-primary text-primary-foreground' : 'border-slate-200 bg-white text-slate-600 hover:border-primary/50 hover:text-slate-950'}`}
    >
      <div className={`size-3.5 rounded border flex items-center justify-center shrink-0 transition-colors ${active ? 'bg-primary-foreground/20 border-transparent' : 'border-muted-foreground/30'}`}>
        {active && <Check className="size-2.5 text-current" strokeWidth={3} />}
      </div>
      {label}
    </button>
  )
}
