"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { Job } from "@/lib/types"
import { filterJobs } from "@/lib/jobs"

const JOBS_PER_PAGE = 20

export function useJobSearch(jobs: Job[]) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([])
  const [accommodationNotProvided, setAccommodationNotProvided] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategories, selectedCountries, selectedJobTypes, accommodationNotProvided])

  const categories = useMemo(() => {
    const allCategories = jobs.map((job) => job.category)
    return [...new Set(allCategories)].map((category) => ({
      value: category,
      label: category,
    }))
  }, [jobs])

  const filteredJobs = useMemo(
    () =>
      filterJobs(jobs, {
        searchTerm,
        selectedCategories,
        selectedCountries,
        selectedJobTypes,
        accommodationNotProvided,
      }),
    [jobs, searchTerm, selectedCategories, selectedCountries, selectedJobTypes, accommodationNotProvided],
  )

  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * JOBS_PER_PAGE
    return filteredJobs.slice(startIndex, startIndex + JOBS_PER_PAGE)
  }, [filteredJobs, currentPage])

  const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE)

  const resetFilters = useCallback(() => {
    setSearchTerm("")
    setSelectedCategories([])
    setSelectedCountries([])
    setSelectedJobTypes([])
    setAccommodationNotProvided(false)
    setCurrentPage(1)
  }, [])

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedCountries.length > 0 ||
    selectedJobTypes.length > 0 ||
    accommodationNotProvided ||
    searchTerm.length > 0

  return {
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
  }
}
