"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { getSupabaseBrowserClient } from "@/lib/utils/supabase/client"
import type { User } from "@supabase/supabase-js"
import {
  BookmarkPlus,
  Bookmark,
  Filter,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import JobDetail from "@/components/ui/job-detail"
import { toast } from "sonner"
import { Job } from "@/lib/types"
import { Filters } from "@/components/ui/filters"
import { QuickFilters } from "@/components/ui/quick-filters"
import { countries as countryData } from "@/lib/countries_sk"
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
}: {
  jobs: Job[]
}) {
  const supabase = getSupabaseBrowserClient()
  const [user, setUser] = useState<User | null>(null)
  const [jobs] = useState(initialJobs)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [savedJobs, setSavedJobs] = useState<number[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([])
  const [isAccommodationProvided, setIsAccommodationProvided] = useState(false)
  const [isAccommodationPaid, setIsAccommodationPaid] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const jobsPerPage = 20
  const [scrollPosition, setScrollPosition] = useState(0)
  const mainContainerRef = useRef<HTMLDivElement>(null)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    // Initial check
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase.auth])

  const handleSelectJob = (job: Job) => {
    setScrollPosition(window.scrollY)
    setSelectedJob(job)
  }

  const handleBack = () => {
    setSelectedJob(null)
  }

  useEffect(() => {
    if (selectedJob) {
      window.scrollTo(0, 0)
    } else {
      window.scrollTo(0, scrollPosition)
    }
  }, [selectedJob, scrollPosition])

  const categories = useMemo(() => {
    const allCategories = initialJobs.map((job) => job.category)
    return [...new Set(allCategories)].map((category) => ({
      value: category,
      label: category,
    }))
  }, [initialJobs])

  const countries = countryData;

  const jobTypes = [
    { id: "zivnost", label: "Živnosť" },
    { id: "na-zmluvu", label: "Na zmluvu" },
    { id: "brigada", label: "Brigáda" },
  ]

  const filteredJobs = useMemo(() => {
    const sortedJobs = [...jobs].sort((a, b) => {
      if (a.isTop && !b.isTop) return -1
      if (!a.isTop && b.isTop) return 1
      if (a.isTop && b.isTop) {
        return new Date(b.topped_at!).getTime() - new Date(a.topped_at!).getTime()
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    return sortedJobs.filter((job) => {
      const searchMatch = job.title.toLowerCase().includes(searchTerm.toLowerCase())
      const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(job.category)
      const countryMatch = selectedCountries.length === 0 || selectedCountries.includes(job.country_code)
      const jobTypeMatch = selectedJobTypes.length === 0 || selectedJobTypes.includes(job.jobType)
      const accommodationProvidedMatch = !isAccommodationProvided || job.accommodation_provided
      const accommodationPaidMatch = !isAccommodationPaid || job.accommodation_paid
      return searchMatch && categoryMatch && countryMatch && jobTypeMatch && accommodationProvidedMatch && accommodationPaidMatch
    })
  }, [jobs, searchTerm, selectedCategories, selectedCountries, selectedJobTypes, isAccommodationProvided, isAccommodationPaid])

  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * jobsPerPage
    const endIndex = startIndex + jobsPerPage
    return filteredJobs.slice(startIndex, endIndex)
  }, [filteredJobs, currentPage, jobsPerPage])

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage)

  const resetFilters = () => {
    setSearchTerm("")
    setSelectedCategories([])
    setSelectedCountries([])
    setSelectedJobTypes([])
    setIsAccommodationProvided(false)
    setIsAccommodationPaid(false)
  }

  const toggleSaveJob = (jobId: number) => {
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
      toast.info("Uloženie zrušené")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="max-w-screen-2xl mx-auto w-full">
        <main className="flex-grow">
          <>
            <div className="p-4 md:hidden">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filtrovať
                <ChevronDown
                  className={`ml-2 h-4 w-4 transition-transform ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </Button>
            </div>
            {showFilters && (
              <div className="p-4 md:hidden">
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
                  isAccommodationProvided={isAccommodationProvided}
                  setIsAccommodationProvided={setIsAccommodationProvided}
                  isAccommodationPaid={isAccommodationPaid}
                  setIsAccommodationPaid={setIsAccommodationPaid}
                  resetFilters={resetFilters}
                />
                <Button
                  variant="outline"
                  className="w-full mt-4 bg-black text-white"
                  onClick={() => setShowFilters(false)}
                >
                  Zobraziť výsledky
                </Button>
              </div>
            )}
            <div className="flex">
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
                isAccommodationProvided={isAccommodationProvided}
                setIsAccommodationProvided={setIsAccommodationProvided}
                isAccommodationPaid={isAccommodationPaid}
                setIsAccommodationPaid={setIsAccommodationPaid}
                resetFilters={resetFilters}
                filteredJobsCount={filteredJobs.length}
                viewMode={viewMode}
                setViewMode={setViewMode}
              />
              <div className="flex-1" ref={mainContainerRef}>
                {selectedJob ? (
                  <div className="p-4">
                    <JobDetail job={selectedJob} onBack={handleBack} />
                  </div>
                ) : (
                  <div className="p-4">
                    <div
                      className={
                        viewMode === "grid"
                          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                          : "flex flex-col gap-4"
                      }
                    >
                      {paginatedJobs.map((job) => (
                        <div
                          key={job.id}
                          className="bg-white p-4 rounded-lg border cursor-pointer hover:shadow-md transition-shadow relative flex flex-col h-full overflow-hidden"
                          onClick={() => handleSelectJob(job)}
                        >
                          {job.isTop && (
                            <div className="absolute top-0 left-0 w-0 h-0 border-t-[35px] border-t-blue-600 border-r-[35px] border-r-transparent">
                              <span className="absolute -top-[28px] left-[6px] text-white text-[9px] font-bold transform -rotate-45">
                                TOP
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between items-start">
                            <h3 className="text-lg font-bold pr-8">
                              {job.title}
                            </h3>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleSaveJob(job.id)
                              }}
                              className="absolute top-2 right-2 bg-gray-100 hover:bg-gray-200 rounded-md"
                            >
                              {savedJobs.includes(job.id) ? (
                                <Bookmark className="h-6 w-6 fill-blue-700 text-blue-700" />
                              ) : (
                                <BookmarkPlus className="h-6 w-6 text-blue-700" />
                              )}
                            </Button>
                          </div>
                          <p className="text-sm text-gray-500 mt-2">
                            {job.company}
                          </p>
                          <div className="flex-grow mt-2">
                            <p className="text-sm text-gray-600">
                              {job.description.substring(0, 200)}
                              {job.description.length > 200 ? "..." : ""}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                            <div
                              className={`flag flag-${job.country_code?.toLowerCase()}`}
                            />
                            <span>{job.country?.name}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary">{job.jobType}</Badge>
                            <Badge variant="secondary">{job.salary}</Badge>
                            <Badge variant="secondary">{job.category}</Badge>
                          </div>
                          <div className="flex justify-between items-center mt-auto pt-4">
                            <p className="text-xs text-gray-400">
                              {new Date(job.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {totalPages > 1 && (
                      <div className="mt-8 flex justify-center">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault()
                                  setCurrentPage((prev) => Math.max(prev - 1, 1))
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
                                  onClick={(e) => {
                                    e.preventDefault()
                                    setCurrentPage(i + 1)
                                  }}
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
                                  setCurrentPage((prev) =>
                                    Math.min(prev + 1, totalPages)
                                  )
                                }}
                              >
                                Ďalšie
                              </PaginationNext>
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        </main>
      </div>
      <footer className="bg-black text-white py-8 px-4 mt-8">
        <div className="max-w-screen-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-medium mb-4">O JobWest</h3>
              <p className="text-gray-400 text-sm">
                JobWest je portál pracovných ponúk zameraný na prácu v zahraničí. Ponúkame pracovné príležitosti v
                krajinách západnej Európy a USA.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Rýchle odkazy</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Domov
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Hľadať prácu
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pre zamestnávateľov
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Kontakt
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Podmienky používania
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Kontakt</h3>
              <address className="not-italic text-sm text-gray-400">
                <p>JobWest s.r.o.</p>
                <p>Hlavná 123</p>
                <p>811 01 Bratislava</p>
                <p className="mt-2">info@jobwest.eu</p>
                <p>+421 900 123 456</p>
              </address>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
            <p>© 2025 JobWest. Všetky práva vyhradené.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
