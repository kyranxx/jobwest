"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import {
  BookmarkPlus,
  Bookmark,
  Filter,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AddAdButton } from "@/components/auth/add-ad-button"
import { Badge } from "@/components/ui/badge"
import JobDetail from "@/components/ui/job-detail"
import { toast } from "sonner"
import { Job } from "@/lib/types"
import { QuickFilters } from "@/components/ui/quick-filters"
import { MoreFilters } from "@/components/ui/more-filters"
import { X } from "lucide-react"
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
  userButton,
}: {
  jobs: Job[]
  userButton: React.ReactElement
}) {
  const [jobs] = useState(initialJobs)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [savedJobs, setSavedJobs] = useState<number[]>([])
  const [viewMode] = useState<"grid" | "list">("grid")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([])
  const [isAccommodationProvided, setIsAccommodationProvided] = useState(false)
  const [isAccommodationPaid, setIsAccommodationPaid] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const jobsPerPage = 20
  const [scrollPosition, setScrollPosition] = useState(0)
  const mainContainerRef = useRef<HTMLDivElement>(null)

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

  const getOfferText = (count: number) => {
    if (count === 1) return "ponuka"
    if (count >= 2 && count <= 4) return "ponuky"
    return "ponúk"
  }

  const resetFilters = () => {
    setSearchTerm("")
    setSelectedCategories([])
    setSelectedCountries([])
    setSelectedJobTypes([])
    setIsAccommodationProvided(false)
    setIsAccommodationPaid(false)
  }

  const toggleSaveJob = (jobId: number) => {
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
        <header className="h-16 border-b bg-white px-4 py-2 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center">
            <Link href="/">
              <Image src="/logo.png" alt="JobWest Logo" width={150} height={50} className="h-12 w-auto" />
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <AddAdButton />
            {userButton}
          </div>
        </header>
        <main className="flex-grow">
          <div className="grid grid-cols-1 md:grid-cols-12 items-start">
            <div className="col-span-1 md:col-span-12" ref={mainContainerRef}>
              {selectedJob ? (
                <JobDetail job={selectedJob} onBack={handleBack} />
              ) : (
                <div className="p-4">
                  <div className="mb-8">
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
                    />
                    <div className="flex justify-end mt-4">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button variant="outline">
                            <Filter className="mr-2 h-4 w-4" />
                            Viac filtrov
                          </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-full max-w-sm overflow-y-auto">
                          <MoreFilters
                            isAccommodationProvided={isAccommodationProvided}
                            setIsAccommodationProvided={setIsAccommodationProvided}
                            isAccommodationPaid={isAccommodationPaid}
                            setIsAccommodationPaid={setIsAccommodationPaid}
                            resetFilters={resetFilters}
                          />
                        </SheetContent>
                      </Sheet>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedCategories.map((category) => (
                      <Badge key={category} variant="secondary" className="flex items-center gap-1 capitalize">
                        {category}
                        <button onClick={() => setSelectedCategories(selectedCategories.filter(item => item !== category))} className="rounded-full hover:bg-gray-300 p-0.5">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    {selectedCountries.map((countryCode) => {
                      const country = countries.find(c => c.code === countryCode);
                      return (
                        <Badge key={countryCode} variant="secondary" className="flex items-center gap-2">
                          {country && <div className={`flag flag-${country.flag} shrink-0`} />}
                          {country?.name}
                          <button onClick={() => setSelectedCountries(selectedCountries.filter(item => item !== countryCode))} className="ml-1 rounded-full hover:bg-gray-300 p-0.5">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )
                    })}
                    {selectedJobTypes.map((jobType) => {
                      const type = jobTypes.find(t => t.id === jobType);
                      return (
                        <Badge key={jobType} variant="secondary" className="flex items-center gap-1">
                          {type?.label}
                          <button onClick={() => setSelectedJobTypes(selectedJobTypes.filter(item => item !== jobType))} className="rounded-full hover:bg-gray-300 p-0.5">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )
                    })}
                    {isAccommodationProvided && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        Ubytovanie zabezpečené
                        <button onClick={() => setIsAccommodationProvided(false)} className="rounded-full hover:bg-gray-300 p-0.5">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {isAccommodationPaid && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        Ubytovanie hradené
                        <button onClick={() => setIsAccommodationPaid(false)} className="rounded-full hover:bg-gray-300 p-0.5">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">
                      {filteredJobs.length} {getOfferText(filteredJobs.length)}
                    </h2>
                  </div>
                  <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "flex flex-col gap-4"}>
                    {paginatedJobs.map((job) => (
                      <div
                        key={job.id}
                        className="bg-white p-4 rounded-lg border cursor-pointer hover:shadow-md transition-shadow relative flex flex-col h-full overflow-hidden"
                        onClick={() => handleSelectJob(job)}
                      >
                        {job.isTop && (
                          <div className="absolute top-0 left-0 w-0 h-0 border-t-[30px] border-t-blue-600 border-r-[30px] border-r-transparent">
                            <span className="absolute -top-[28px] left-[2px] text-white text-[8px] font-bold transform -rotate-45">TOP</span>
                          </div>
                        )}
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-bold pr-8">{job.title}</h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSaveJob(job.id);
                            }}
                            className="absolute top-4 right-4"
                          >
                            {savedJobs.includes(job.id) ? (
                              <Bookmark className="h-5 w-5 fill-blue-700 text-blue-700" />
                            ) : (
                              <BookmarkPlus className="h-5 w-5 text-blue-700" />
                            )}
                          </Button>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">{job.company}</p>
                        <div className="flex-grow mt-2">
                          <p className="text-sm text-gray-600">{job.description.substring(0, 200)}{job.description.length > 200 ? "..." : ""}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                          <div className={`flag flag-${job.country_code?.toLowerCase()}`} />
                          <span>{job.country?.name}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary">{job.jobType}</Badge>
                          <Badge variant="secondary">{job.salary}</Badge>
                          <Badge variant="secondary">{job.category}</Badge>
                        </div>
                        <div className="flex justify-between items-center mt-auto pt-4">
                          <p className="text-xs text-gray-400">{new Date(job.created_at).toLocaleDateString()}</p>
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
                            />
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
                                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                              }}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
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
