"use client"

import dynamic from "next/dynamic"
import { useCallback, useEffect, useReducer, useRef, useState, type RefObject } from "react"
import {
  ChevronDown,
  Search,
  X,
  SlidersHorizontal,
  Info,
  LayoutGrid,
  Rows3,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { JobCard } from "@/components/ui/job-card"
import { toast } from "sonner"
import { Job, type HighlightTier } from "@/lib/types"
import { Filters } from "@/components/ui/filters"
import { QuickFilters } from "@/components/ui/quick-filters"
import { countries } from "@/lib/countries"
import { highlightOptions, jobTypes, languageOptions, salaryCurrencies } from "@/lib/job-options"
import { useJobSearch } from "@/hooks/use-job-search"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import type { SortMode } from "@/hooks/use-job-search"

type ViewMode = "grid" | "list"

const EmployerCtaButton = dynamic(
  () => import("@/components/auth/employer-cta-button").then((mod) => mod.EmployerCtaButton),
  { ssr: false },
)

const sortLabels: Record<SortMode, string> = {
  recommended: "Relevantné",
  newest: "Najnovšie",
  "salary-desc": "Najvyššia mzda",
}

type PortalState = {
  savedJobs: Array<Job["id"]>
  viewMode: ViewMode
  showFilters: boolean
  showPricingInfo: boolean
}

type PortalAction =
  | { type: "toggle-save"; jobId: Job["id"] }
  | { type: "set-saved-jobs"; jobIds: Array<Job["id"]> }
  | { type: "set-view-mode"; viewMode: ViewMode }
  | { type: "set-filters-visible"; visible: boolean }
  | { type: "toggle-pricing-info" }

const initialPortalState: PortalState = {
  savedJobs: [],
  viewMode: "list",
  showFilters: false,
  showPricingInfo: false,
}

function portalReducer(state: PortalState, action: PortalAction): PortalState {
  switch (action.type) {
    case "toggle-save":
      return {
        ...state,
        savedJobs: state.savedJobs.includes(action.jobId)
          ? state.savedJobs.filter((id) => id !== action.jobId)
          : [...state.savedJobs, action.jobId],
      }
    case "set-saved-jobs":
      return { ...state, savedJobs: action.jobIds }
    case "set-view-mode":
      return { ...state, viewMode: action.viewMode }
    case "set-filters-visible":
      return { ...state, showFilters: action.visible }
    case "toggle-pricing-info":
      return { ...state, showPricingInfo: !state.showPricingInfo }
  }
}

function useIsHydrated() {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  return isHydrated
}

export default function JobPortalClient({
  jobs: initialJobs,
}: {
  jobs: Job[]
}) {
  const [state, dispatch] = useReducer(portalReducer, initialPortalState)
  const [savedJobsLoaded, setSavedJobsLoaded] = useState(false)
  const isHydrated = useIsHydrated()
  const jobs = initialJobs
  const jobGridRef = useRef<HTMLDivElement>(null)
  const {
    searchTerm,
    setSearchTerm,
    selectedCategories,
    setSelectedCategories,
    selectedCountries,
    setSelectedCountries,
    selectedJobTypes,
    setSelectedJobTypes,
    selectedLanguages,
    setSelectedLanguages,
    selectedHighlightTiers,
    setSelectedHighlightTiers,
    accommodationProvided,
    setAccommodationProvided,
    minSalary,
    setMinSalary,
    salaryCurrency,
    setSalaryCurrency,
    currentPage,
    setCurrentPage,
    categories,
    filteredJobs,
    paginatedJobs,
    sortMode,
    setSortMode,
    totalPages,
    resetFilters,
    hasActiveFilters,
  } = useJobSearch(jobs)

  useEffect(() => {
    try {
      const savedValue = window.localStorage.getItem("jobwest:saved-jobs")
      const parsedValue = savedValue ? JSON.parse(savedValue) : []

      if (Array.isArray(parsedValue)) {
        dispatch({ type: "set-saved-jobs", jobIds: parsedValue })
      }
    } catch {
      window.localStorage.removeItem("jobwest:saved-jobs")
    } finally {
      setSavedJobsLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (!savedJobsLoaded) return
    window.localStorage.setItem("jobwest:saved-jobs", JSON.stringify(state.savedJobs))
  }, [savedJobsLoaded, state.savedJobs])

  const scrollToJobGrid = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    scrollToJobGrid()
  }, [scrollToJobGrid, setCurrentPage])

  const notifyFilterCommit = useCallback((message: string) => {
    toast.success(message, {
      description: "Výsledky sa aktualizovali.",
      duration: 1800,
    })
  }, [])

  const handleSortModeChange = useCallback((nextSortMode: SortMode) => {
    setSortMode(nextSortMode)
    toast.success(`Zoradené: ${sortLabels[nextSortMode]}`, {
      description: "Poradie ponúk je upravené.",
      duration: 1800,
    })
  }, [setSortMode])

  const handleViewModeChange = useCallback((viewMode: ViewMode, message: string) => {
    dispatch({ type: "set-view-mode", viewMode })
    toast.success(message, { duration: 1600 })
  }, [])

  const toggleSaveJob = useCallback((jobId: Job["id"]) => {
    const isSaving = !state.savedJobs.includes(jobId)
    dispatch({ type: "toggle-save", jobId })
    if (isSaving) {
      toast.success("Pracovná ponuka uložená")
    } else {
      toast.info("Uloženie ponuky zrušené")
    }
  }, [state.savedJobs])

  return (
    <div
      data-cy="job-portal"
      data-ready={isHydrated ? "true" : "false"}
      className="min-h-screen bg-[#f6f7f2] flex flex-col"
    >
      <div className="mx-auto w-full">
        <main className="flex-grow">
          <div className="mx-auto max-w-screen-2xl px-4 py-5 md:px-6 md:py-6">
            <PortalSearchPanel
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              showPricingInfo={state.showPricingInfo}
              onSearchSuggestion={(value) => {
                setSearchTerm(value)
                notifyFilterCommit("Vyhľadávanie bolo použité")
              }}
              onTogglePricingInfo={() => dispatch({ type: "toggle-pricing-info" })}
            />

            <MobileFilterToggle
              showFilters={state.showFilters}
              hasActiveFilters={hasActiveFilters}
              onToggle={() => {
                dispatch({
                  type: "set-filters-visible",
                  visible: !state.showFilters,
                })
                toast.info(state.showFilters ? "Filtre zatvorené" : "Filtre otvorené", { duration: 1400 })
              }}
            />

            {state.showFilters && (
              <MobileFiltersPanel
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
                categories={categories}
                selectedCountries={selectedCountries}
                setSelectedCountries={setSelectedCountries}
                selectedJobTypes={selectedJobTypes}
                setSelectedJobTypes={setSelectedJobTypes}
                selectedLanguages={selectedLanguages}
                setSelectedLanguages={setSelectedLanguages}
                selectedHighlightTiers={selectedHighlightTiers}
                setSelectedHighlightTiers={setSelectedHighlightTiers}
                accommodationProvided={accommodationProvided}
                setAccommodationProvided={setAccommodationProvided}
                minSalary={minSalary}
                setMinSalary={setMinSalary}
                salaryCurrency={salaryCurrency}
                setSalaryCurrency={setSalaryCurrency}
                resetFilters={resetFilters}
                filteredJobsCount={filteredJobs.length}
                onFilterCommit={notifyFilterCommit}
                onClose={() => {
                  dispatch({ type: "set-filters-visible", visible: false })
                  toast.success(`Zobrazených ${filteredJobs.length} ponúk`, { duration: 1800 })
                }}
              />
            )}

            <div className="flex gap-5 xl:gap-6">
              <Filters
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
                categories={categories}
                selectedCountries={selectedCountries}
                setSelectedCountries={setSelectedCountries}
                countries={countries}
                selectedJobTypes={selectedJobTypes}
                setSelectedJobTypes={setSelectedJobTypes}
                jobTypes={jobTypes}
                selectedLanguages={selectedLanguages}
                setSelectedLanguages={setSelectedLanguages}
                languageOptions={languageOptions}
                selectedHighlightTiers={selectedHighlightTiers}
                setSelectedHighlightTiers={setSelectedHighlightTiers}
                highlightOptions={highlightOptions}
                accommodationProvided={accommodationProvided}
                setAccommodationProvided={setAccommodationProvided}
                minSalary={minSalary}
                setMinSalary={setMinSalary}
                salaryCurrency={salaryCurrency}
                setSalaryCurrency={setSalaryCurrency}
                salaryCurrencies={salaryCurrencies}
                resetFilters={resetFilters}
                filteredJobsCount={filteredJobs.length}
                viewMode={state.viewMode}
                setViewMode={(viewMode) =>
                  dispatch({ type: "set-view-mode", viewMode })
                }
                onFilterCommit={notifyFilterCommit}
                onViewModeChange={(message) => toast.success(message, { duration: 1600 })}
              />

              <div className="flex-1 min-w-0">
                <JobResults
                    currentPage={currentPage}
                    searchTerm={searchTerm}
                    selectedCategories={selectedCategories}
                    selectedCountries={selectedCountries}
                    selectedJobTypes={selectedJobTypes}
                    selectedLanguages={selectedLanguages}
                    selectedHighlightTiers={selectedHighlightTiers}
                    accommodationProvided={accommodationProvided}
                    minSalary={minSalary}
                    salaryCurrency={salaryCurrency}
                    filteredJobs={filteredJobs}
                    hasActiveFilters={hasActiveFilters}
                    jobGridRef={jobGridRef}
                    paginatedJobs={paginatedJobs}
                    resetFilters={resetFilters}
                    savedJobs={state.savedJobs}
                    selectedViewMode={state.viewMode}
                    sortMode={sortMode}
                    onSortModeChange={handleSortModeChange}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    onToggleSave={toggleSaveJob}
                    onSetViewMode={handleViewModeChange}
                  />
              </div>
            </div>
          </div>
        </main>
        <EmployerStickyCta />
      </div>
    </div>
  )
}

function PortalSearchPanel({
  searchTerm,
  setSearchTerm,
  showPricingInfo,
  onSearchSuggestion,
  onTogglePricingInfo,
}: {
  searchTerm: string
  setSearchTerm: (value: string) => void
  showPricingInfo: boolean
  onSearchSuggestion: (value: string) => void
  onTogglePricingInfo: () => void
}) {
  const suggestions = ["Zvárač", "Skladník", "Nemecko", "S ubytovaním"]

  return (
    <div
      id="ponuky"
      className="mb-4 scroll-mt-20 rounded-lg border border-[#ded9df] bg-white p-3 shadow-[0_16px_48px_rgba(36,16,51,0.06)]"
    >
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#7a7280]" />
            <input
              id="job-search"
              name="job-search"
              data-cy="job-search"
              aria-label="Hľadať pracovnú ponuku"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Hľadať pozíciu, firmu, krajinu..."
              className="h-[52px] w-full rounded-md border border-[#d9d3dc] bg-white pl-12 pr-10 text-base font-medium text-[#241033] outline-none transition placeholder:text-[#7a7280] focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 rounded p-1 -translate-y-1/2 hover:bg-[#f3f1ee]"
                aria-label="Vymazať vyhľadávanie"
              >
                <X className="size-3.5 text-slate-500" />
              </button>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onSearchSuggestion(suggestion)}
                className="rounded-md border border-[#ddd8df] bg-[#fbfaf8] px-3 py-1.5 text-xs font-semibold text-[#3f3947] transition hover:border-[#d4a8c4] hover:bg-[#fbf4f8] hover:text-primary"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:w-72">
          <button
            type="button"
            data-cy="pricing-info-toggle"
            onClick={onTogglePricingInfo}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6a6270] transition-colors hover:text-[#241033]"
          >
            <Info className="size-3.5" />
            Ako funguje pridávanie inzerátov?
          </button>
          {showPricingInfo && (
            <div
              data-cy="pricing-info-panel"
              className="mt-2 space-y-1 rounded-md border border-emerald-100 bg-emerald-50 p-3 text-xs text-[#3f3947] animate-fade-in"
            >
              <p><span className="font-medium text-slate-950">Pridanie inzerátu</span> je <span className="font-medium text-emerald-800">zadarmo</span>.</p>
              <p><span className="font-medium text-slate-950">TOP zvýraznenie</span>: vyššie v zozname za 9,90 EUR.</p>
              <p><span className="font-medium text-slate-950">Exclusive zvýraznenie</span>: najvyššia viditeľnosť za 19,90 EUR.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MobileFilterToggle({
  showFilters,
  hasActiveFilters,
  onToggle,
}: {
  showFilters: boolean
  hasActiveFilters: boolean
  onToggle: () => void
}) {
  return (
    <div data-cy="mobile-filter-bar" className="sticky top-14 z-30 mb-3 bg-[#f6f7f2]/95 py-2 backdrop-blur md:hidden">
      <Button
        variant="outline"
        className="w-full justify-between h-10 text-sm"
        onClick={onToggle}
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal className="size-4" />
          Filtrovať
          {hasActiveFilters && (
            <span className="size-2 rounded-full bg-primary" />
          )}
        </span>
        <ChevronDown className={`size-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
      </Button>
    </div>
  )
}

function MobileFiltersPanel({
  selectedCategories,
  setSelectedCategories,
  categories,
  selectedCountries,
  setSelectedCountries,
  selectedJobTypes,
  setSelectedJobTypes,
  selectedLanguages,
  setSelectedLanguages,
  selectedHighlightTiers,
  setSelectedHighlightTiers,
  accommodationProvided,
  setAccommodationProvided,
  minSalary,
  setMinSalary,
  salaryCurrency,
  setSalaryCurrency,
  resetFilters,
  filteredJobsCount,
  onFilterCommit,
  onClose,
}: {
  selectedCategories: string[]
  setSelectedCategories: (categories: string[] | ((prev: string[]) => string[])) => void
  categories: { value: string; label: string }[]
  selectedCountries: string[]
  setSelectedCountries: (countries: string[] | ((prev: string[]) => string[])) => void
  selectedJobTypes: string[]
  setSelectedJobTypes: (jobTypes: string[] | ((prev: string[]) => string[])) => void
  selectedLanguages: string[]
  setSelectedLanguages: (languages: string[] | ((prev: string[]) => string[])) => void
  selectedHighlightTiers: HighlightTier[]
  setSelectedHighlightTiers: (tiers: HighlightTier[] | ((prev: HighlightTier[]) => HighlightTier[])) => void
  accommodationProvided: boolean
  setAccommodationProvided: (value: boolean) => void
  minSalary: string
  setMinSalary: (value: string) => void
  salaryCurrency: string
  setSalaryCurrency: (value: string) => void
  resetFilters: () => void
  filteredJobsCount: number
  onFilterCommit: (message: string) => void
  onClose: () => void
}) {
  return (
    <div className="md:hidden mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_12px_35px_rgba(39,55,32,0.08)] animate-fade-in">
      <QuickFilters
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        categories={categories}
        selectedCountries={selectedCountries}
        setSelectedCountries={setSelectedCountries}
        countries={countries}
        selectedJobTypes={selectedJobTypes}
        setSelectedJobTypes={setSelectedJobTypes}
        jobTypes={jobTypes}
        selectedLanguages={selectedLanguages}
        setSelectedLanguages={setSelectedLanguages}
        languageOptions={languageOptions}
        selectedHighlightTiers={selectedHighlightTiers}
        setSelectedHighlightTiers={setSelectedHighlightTiers}
        highlightOptions={highlightOptions}
        accommodationProvided={accommodationProvided}
        setAccommodationProvided={setAccommodationProvided}
        minSalary={minSalary}
        setMinSalary={setMinSalary}
        salaryCurrency={salaryCurrency}
        setSalaryCurrency={setSalaryCurrency}
        salaryCurrencies={salaryCurrencies}
        resetFilters={resetFilters}
        idPrefix="mobile"
        onFilterCommit={onFilterCommit}
      />
      <Button className="w-full mt-3" onClick={onClose}>
        Zobraziť výsledky ({filteredJobsCount})
      </Button>
    </div>
  )
}

function JobResults({
  currentPage,
  searchTerm,
  selectedCategories,
  selectedCountries,
  selectedJobTypes,
  selectedLanguages,
  selectedHighlightTiers,
  accommodationProvided,
  minSalary,
  salaryCurrency,
  filteredJobs,
  hasActiveFilters,
  jobGridRef,
  paginatedJobs,
  resetFilters,
  savedJobs,
  selectedViewMode,
  sortMode,
  totalPages,
  onSortModeChange,
  onPageChange,
  onToggleSave,
  onSetViewMode,
}: {
  currentPage: number
  searchTerm: string
  selectedCategories: string[]
  selectedCountries: string[]
  selectedJobTypes: string[]
  selectedLanguages: string[]
  selectedHighlightTiers: HighlightTier[]
  accommodationProvided: boolean
  minSalary: string
  salaryCurrency: string
  filteredJobs: Job[]
  hasActiveFilters: boolean
  jobGridRef: RefObject<HTMLDivElement | null>
  paginatedJobs: Job[]
  resetFilters: () => void
  savedJobs: Array<Job["id"]>
  selectedViewMode: ViewMode
  sortMode: SortMode
  totalPages: number
  onSortModeChange: (sortMode: SortMode) => void
  onPageChange: (page: number) => void
  onToggleSave: (jobId: Job["id"]) => void
  onSetViewMode: (viewMode: ViewMode, message: string) => void
}) {
  return (
    <>
      <ResultsToolbar
        filteredJobsCount={filteredJobs.length}
        hasActiveFilters={hasActiveFilters}
        resetFilters={resetFilters}
        selectedViewMode={selectedViewMode}
        sortMode={sortMode}
        onSortModeChange={onSortModeChange}
        onSetViewMode={onSetViewMode}
      />

      {hasActiveFilters && (
        <ActiveFilterSummary
          searchTerm={searchTerm}
          selectedCategories={selectedCategories}
          selectedCountries={selectedCountries}
          selectedJobTypes={selectedJobTypes}
          selectedLanguages={selectedLanguages}
          selectedHighlightTiers={selectedHighlightTiers}
          accommodationProvided={accommodationProvided}
          minSalary={minSalary}
          salaryCurrency={salaryCurrency}
          resetFilters={resetFilters}
        />
      )}

      <div
        ref={jobGridRef}
        data-cy="job-list"
        className={
          selectedViewMode === "grid"
            ? "grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-3"
            : "overflow-hidden rounded-lg border border-[#ded9df] bg-white shadow-[0_14px_44px_rgba(36,16,51,0.05)]"
        }
      >
        {paginatedJobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            isSaved={savedJobs.includes(job.id)}
            viewMode={selectedViewMode}
            onToggleSave={onToggleSave}
          />
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Search className="size-6 text-muted-foreground/40" />
          </div>
          <h2 className="text-base font-semibold mb-1">Žiadne ponuky</h2>
          <p className="text-sm text-muted-foreground mb-4 max-w-md">
            Nenašli sme žiadne ponuky zodpovedajúce vašim filtrom. Skúste upraviť vyhľadávanie alebo resetujte filtre.
          </p>
          <Button onClick={resetFilters} variant="outline" size="sm">
            <X className="mr-1.5 size-3.5" />
            Resetovať filtre
          </Button>
        </div>
      )}

      {totalPages > 1 && (
        <JobPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}

      <EmployerLaunchPanel />
    </>
  )
}

function EmployerLaunchPanel() {
  return (
    <section className="mt-6 rounded-lg border border-[#ded9df] bg-white p-5 shadow-[0_14px_44px_rgba(36,16,51,0.04)]">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div>
          <h2 className="text-base font-semibold text-slate-950">Pre firmy a agentúry</h2>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600">
            Pridanie inzerátu je zdarma. Platíte iba vtedy, keď chcete dostať ponuku vyššie
            v zozname cez TOP alebo Exclusive zvýraznenie.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {["Bezplatné pridanie", "TOP od 9,90 EUR", "Kontakty v popise"].map((item) => (
              <div key={item} className="rounded-full border border-emerald-100 bg-emerald-50/70 px-3 py-2 text-xs font-medium text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </div>
        <EmployerCtaButton className="w-full lg:w-auto" />
      </div>
    </section>
  )
}

function EmployerStickyCta() {
  return (
    <div className="fixed bottom-4 right-4 z-40 hidden md:block">
      <EmployerCtaButton className="h-10 rounded-full shadow-[0_12px_30px_rgba(21,93,68,0.22)]" />
    </div>
  )
}

function ResultsToolbar({
  filteredJobsCount,
  hasActiveFilters,
  resetFilters,
  selectedViewMode,
  sortMode,
  onSortModeChange,
  onSetViewMode,
}: {
  filteredJobsCount: number
  hasActiveFilters: boolean
  resetFilters: () => void
  selectedViewMode: ViewMode
  sortMode: SortMode
  onSortModeChange: (sortMode: SortMode) => void
  onSetViewMode: (viewMode: ViewMode, message: string) => void
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-foreground">{filteredJobsCount}</span>{" "}
          {filteredJobsCount === 1 ? "ponuka" : filteredJobsCount >= 2 && filteredJobsCount <= 4 ? "ponuky" : "ponúk"}
          <span className="hidden text-slate-400 sm:inline"> v prehľadnom zozname</span>
          {hasActiveFilters && (
            <button onClick={resetFilters} className="text-primary hover:underline text-xs ml-1.5">
              zrušiť filtre
            </button>
          )}
        </p>
      </div>
      <div className="flex items-center justify-between gap-2 sm:justify-end">
        <label className="sr-only" htmlFor="job-sort">Zoradenie ponúk</label>
        <select
          id="job-sort"
          name="job-sort"
          data-cy="sort-select"
          value={sortMode}
          onChange={(event) => onSortModeChange(event.target.value as SortMode)}
          className="h-9 w-[178px] rounded-md border border-[#d9d3dc] bg-white px-3 text-xs font-semibold text-[#3f3947] shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-emerald-100"
        >
          <option value="newest">Najnovšie</option>
          <option value="salary-desc">Najvyššia mzda</option>
          <option value="recommended">Relevantné</option>
        </select>
        <div className="flex items-center gap-1 md:hidden">
        <Button
          variant={selectedViewMode === "grid" ? "default" : "outline"}
          size="icon"
          className="size-7 rounded"
          onClick={() => onSetViewMode("grid", "Zobrazenie prepnuté na mriežku")}
          aria-label="Mriežka"
        >
          <LayoutGrid className="size-3.5" />
        </Button>
        <Button
          variant={selectedViewMode === "list" ? "default" : "outline"}
          size="icon"
          className="size-7 rounded"
          onClick={() => onSetViewMode("list", "Zobrazenie prepnuté na zoznam")}
          aria-label="Zoznam"
        >
          <Rows3 className="size-3.5" />
        </Button>
        </div>
      </div>
    </div>
  )
}

function ActiveFilterSummary({
  searchTerm,
  selectedCategories,
  selectedCountries,
  selectedJobTypes,
  selectedLanguages,
  selectedHighlightTiers,
  accommodationProvided,
  minSalary,
  salaryCurrency,
  resetFilters,
}: {
  searchTerm: string
  selectedCategories: string[]
  selectedCountries: string[]
  selectedJobTypes: string[]
  selectedLanguages: string[]
  selectedHighlightTiers: HighlightTier[]
  accommodationProvided: boolean
  minSalary: string
  salaryCurrency: string
  resetFilters: () => void
}) {
  const activeItems = [
    ...(searchTerm ? [`Hľadanie: ${searchTerm}`] : []),
    ...selectedCategories,
    ...selectedCountries.map((country) => country.toUpperCase()),
    ...selectedJobTypes,
    ...selectedLanguages.map((language) => languageOptions.find((option) => option.id === language)?.label ?? language),
    ...selectedHighlightTiers.map((tier) => highlightOptions.find((option) => option.id === tier)?.label ?? tier),
    ...(accommodationProvided ? ["S ubytovaním"] : []),
    ...(minSalary ? [`Mzda od ${minSalary} ${salaryCurrency === "any" ? "" : salaryCurrency}`.trim()] : []),
    ...(salaryCurrency !== "any" && !minSalary ? [`Mena ${salaryCurrency}`] : []),
  ]

  if (activeItems.length === 0) return null

  return (
    <div className="mb-3 flex flex-wrap items-center gap-1.5 rounded-md border border-[#ded9df] bg-white px-3 py-2 text-xs shadow-sm">
      <span className="font-medium text-slate-500">Aktívne filtre</span>
      {activeItems.slice(0, 6).map((item) => (
        <span key={item} className="rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-700">
          {item}
        </span>
      ))}
      {activeItems.length > 6 && (
        <span className="text-slate-500">+{activeItems.length - 6}</span>
      )}
      <button
        type="button"
        onClick={resetFilters}
        className="ml-auto rounded px-2 py-1 font-medium text-primary hover:bg-emerald-50"
      >
        Vymazať
      </button>
    </div>
  )
}

function JobPagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  return (
    <div className="mt-8 flex justify-center">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(event) => {
                event.preventDefault()
                const newPage = Math.max(currentPage - 1, 1)
                if (newPage !== currentPage) onPageChange(newPage)
              }}
            >
              Predchádzajúce
            </PaginationPrevious>
          </PaginationItem>
          {Array.from({ length: totalPages }, (_, index) => {
            const pageNumber = index + 1

            return (
              <PaginationItem key={pageNumber}>
                <PaginationLink
                  href="#"
                  isActive={currentPage === pageNumber}
                  onClick={(event) => {
                    event.preventDefault()
                    onPageChange(pageNumber)
                  }}
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            )
          })}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(event) => {
                event.preventDefault()
                const newPage = Math.min(currentPage + 1, totalPages)
                if (newPage !== currentPage) onPageChange(newPage)
              }}
            >
              Ďalšie
            </PaginationNext>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
