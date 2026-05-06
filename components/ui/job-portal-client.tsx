"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useAuth } from "@/hooks/use-auth"
import {
  ChevronDown,
  Search,
  X,
  SlidersHorizontal,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import JobDetail from "@/components/ui/job-detail"
import { JobCard } from "@/components/ui/job-card"
import { toast } from "sonner"
import { Job } from "@/lib/types"
import { Filters } from "@/components/ui/filters"
import { QuickFilters } from "@/components/ui/quick-filters"
import { countries } from "@/lib/countries"
import { jobTypes } from "@/lib/job-options"
import { useJobSearch } from "@/hooks/use-job-search"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import React from "react"

export default function JobPortalClient({
  jobs: initialJobs,
  isDemoMode = false,
}: {
  jobs: Job[]
  isDemoMode?: boolean
}) {
  const { user } = useAuth()
  const jobs = initialJobs
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [savedJobs, setSavedJobs] = useState<Array<Job["id"]>>([])
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [scrollPosition, setScrollPosition] = useState(0)
  const mainContainerRef = useRef<HTMLDivElement>(null)
  const jobGridRef = useRef<HTMLDivElement>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showPricingInfo, setShowPricingInfo] = useState(false)
  const {
    searchTerm,
    setSearchTerm,
    selectedCategories,
    setSelectedCategories,
    selectedCountries,
    setSelectedCountries,
    selectedJobTypes,
    setSelectedJobTypes,
    accommodationNotProvided,
    setAccommodationNotProvided,
    currentPage,
    setCurrentPage,
    categories,
    filteredJobs,
    paginatedJobs,
    totalPages,
    resetFilters,
    hasActiveFilters,
  } = useJobSearch(jobs)

  const handleSelectJob = useCallback((job: Job) => {
    setScrollPosition(window.scrollY)
    setSelectedJob(job)
  }, [])

  const handleBack = useCallback(() => {
    setSelectedJob(null)
  }, [])

  useEffect(() => {
    if (selectedJob) {
      window.scrollTo(0, 0)
    } else {
      window.scrollTo(0, scrollPosition)
    }
  }, [selectedJob, scrollPosition])

  const scrollToJobGrid = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    scrollToJobGrid()
  }, [scrollToJobGrid, setCurrentPage])

  const toggleSaveJob = useCallback((jobId: Job["id"]) => {
    if (!user) {
      toast.error("Na uloženie ponuky sa musíte prihlásiť.")
      return
    }
    const isSaving = !savedJobs.includes(jobId)
    setSavedJobs((prev) =>
      prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId]
    )
    if (isSaving) {
      toast.success("Pracovná ponuka uložená")
    } else {
      toast.info("Uloženie ponuky zrušené")
    }
  }, [user, savedJobs])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="mx-auto w-full">
        <main className="flex-grow">
          {/* Title + Search */}
          <section className="border-b bg-white">
            <div className="max-w-screen-2xl mx-auto px-3 md:px-6 py-5 md:py-7">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                    Práca v zahraničí
                  </h1>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {jobs.length} aktívnych ponúk
                  </p>
                </div>
                <div className="relative w-full md:max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="job-search"
                    name="job-search"
                    value={searchTerm}
                    onChange={(event) => {
                      setSearchTerm(event.target.value)
                      setCurrentPage(1)
                    }}
                    placeholder="Hľadať pozíciu, firmu, krajinu..."
                    className="h-10 w-full rounded-md border border-input bg-white pl-9 pr-10 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => { setSearchTerm(""); setCurrentPage(1) }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted"
                    >
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </div>

              {/* Pricing info */}
              <div className="mt-3">
                <button
                  onClick={() => setShowPricingInfo(!showPricingInfo)}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Info className="h-3.5 w-3.5" />
                  Ako funguje pridávanie inzerátov?
                </button>
                {showPricingInfo && (
                  <div className="mt-2 rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground space-y-1 animate-fade-in">
                    <p><span className="font-medium text-foreground">Pridanie inzerátu</span> je <span className="text-emerald-600 font-medium">zadarmo</span>.</p>
                    <p><span className="font-medium text-foreground">TOP zvýraznenie</span> — platené. Inzerát sa zobrazuje na vyššej pozícii.</p>
                    <p><span className="font-medium text-foreground">Exclusive zvýraznenie</span> — platené. Inzerát sa zobrazuje na najvyššej pozícii so zvýrazneným rámikom.</p>
                  </div>
                )}
              </div>

              {isDemoMode && (
                <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  Zobrazujem demo ponuky, pretože databáza nevrátila žiadne inzeráty.
                </div>
              )}
            </div>
          </section>

          {/* Filters + Content */}
          <div className="max-w-screen-2xl mx-auto px-3 md:px-6 py-4 md:py-6">
            {/* Mobile Filter Toggle */}
            <div className="md:hidden mb-3">
              <Button
                variant="outline"
                className="w-full justify-between h-10 text-sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <span className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filtrovať
                  {hasActiveFilters && (
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
              </Button>
            </div>

            {showFilters && (
              <div className="md:hidden mb-4 p-4 rounded-lg border bg-card animate-fade-in">
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
                  accommodationNotProvided={accommodationNotProvided}
                  setAccommodationNotProvided={setAccommodationNotProvided}
                  resetFilters={resetFilters}
                />
                <Button
                  className="w-full mt-3"
                  onClick={() => setShowFilters(false)}
                >
                  Zobraziť výsledky ({filteredJobs.length})
                </Button>
              </div>
            )}

            <div className="flex gap-6">
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
                accommodationNotProvided={accommodationNotProvided}
                setAccommodationNotProvided={setAccommodationNotProvided}
                resetFilters={resetFilters}
                filteredJobsCount={filteredJobs.length}
                viewMode={viewMode}
                setViewMode={setViewMode}
              />

              <div className="flex-1 min-w-0" ref={mainContainerRef}>
                {selectedJob ? (
                  <div>
                    <JobDetail job={selectedJob} onBack={handleBack} />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">{filteredJobs.length}</span>{" "}
                        {filteredJobs.length === 1 ? "ponuka" : filteredJobs.length >= 2 && filteredJobs.length <= 4 ? "ponuky" : "ponúk"}
                        {hasActiveFilters && (
                          <button onClick={resetFilters} className="text-primary hover:underline text-xs ml-1.5">
                            (zrušiť filtre)
                          </button>
                        )}
                      </p>
                      <div className="flex items-center gap-1 md:hidden">
                        <Button
                          variant={viewMode === "grid" ? "default" : "outline"}
                          size="icon"
                          className="h-7 w-7 rounded"
                          onClick={() => setViewMode("grid")}
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
                          </svg>
                        </Button>
                        <Button
                          variant={viewMode === "list" ? "default" : "outline"}
                          size="icon"
                          className="h-7 w-7 rounded"
                          onClick={() => setViewMode("list")}
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <rect x="3" y="4" width="18" height="4" rx="1" /><rect x="3" y="10" width="18" height="4" rx="1" /><rect x="3" y="16" width="18" height="4" rx="1" />
                          </svg>
                        </Button>
                      </div>
                    </div>

                    <div
                      ref={jobGridRef}
                      className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4" : "flex flex-col gap-2.5"}
                    >
                      {paginatedJobs.map((job) => (
                        <JobCard
                          key={job.id}
                          job={job}
                          isSaved={savedJobs.includes(job.id)}
                          onSelect={handleSelectJob}
                          onToggleSave={toggleSaveJob}
                        />
                      ))}
                    </div>

                    {filteredJobs.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                          <Search className="h-6 w-6 text-muted-foreground/40" />
                        </div>
                        <h2 className="text-base font-semibold mb-1">Žiadne ponuky</h2>
                        <p className="text-sm text-muted-foreground mb-4 max-w-md">
                          Nenašli sme žiadne ponuky zodpovedajúce vašim filtrom. Skúste upraviť vyhľadávanie alebo resetujte filtre.
                        </p>
                        <Button onClick={resetFilters} variant="outline" size="sm">
                          <X className="mr-1.5 h-3.5 w-3.5" />
                          Resetovať filtre
                        </Button>
                      </div>
                    )}

                    {totalPages > 1 && (
                      <div className="mt-8 flex justify-center">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault()
                                  const newPage = Math.max(currentPage - 1, 1)
                                  if (newPage !== currentPage) handlePageChange(newPage)
                                }}
                              >
                                Predchádzajúce
                              </PaginationPrevious>
                            </PaginationItem>
                            {[...Array(totalPages)].map((_, i) => (
                              <PaginationItem key={i}>
                                <PaginationLink
                                  href="#"
                                  isActive={currentPage === i + 1}
                                  onClick={(e) => { e.preventDefault(); handlePageChange(i + 1) }}
                                >
                                  {i + 1}
                                </PaginationLink>
                              </PaginationItem>
                            ))}
                            <PaginationItem>
                              <PaginationNext
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault()
                                  const newPage = Math.min(currentPage + 1, totalPages)
                                  if (newPage !== currentPage) handlePageChange(newPage)
                                }}
                              >
                                Ďalšie
                              </PaginationNext>
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
