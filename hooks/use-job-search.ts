"use client"

import { useCallback, useMemo, useState, type SetStateAction } from "react"
import type { HighlightTier, Job } from "@/lib/types"
import { filterJobs } from "@/lib/jobs"

const JOBS_PER_PAGE = 10
export type SortMode = "recommended" | "newest" | "salary-desc"

function getSalaryValue(value: string) {
  const numbers = [...value.matchAll(/\d[\d\s]*(?:[,.]\d+)?/g)]
    .map((match) => Number(match[0].replace(/\s/g, "").replace(",", ".")))
    .filter((number) => Number.isFinite(number))

  if (numbers.length === 0) return 0

  return Math.max(...numbers)
}

function sortJobs(jobs: Job[], sortMode: SortMode) {
  if (sortMode === "recommended") return jobs

  return jobs.toSorted((a, b) => {
    if (sortMode === "salary-desc") {
      const salaryDiff = getSalaryValue(b.salary) - getSalaryValue(a.salary)
      if (salaryDiff !== 0) return salaryDiff
    }

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
}

export function useJobSearch(jobs: Job[]) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [selectedHighlightTiers, setSelectedHighlightTiers] = useState<HighlightTier[]>([])
  const [accommodationProvided, setAccommodationProvided] = useState(false)
  const [minSalary, setMinSalary] = useState("")
  const [salaryCurrency, setSalaryCurrency] = useState("any")
  const [sortMode, setSortMode] = useState<SortMode>("newest")
  const [currentPage, setCurrentPage] = useState(1)

  const updateSearchTerm = useCallback((value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }, [])

  const updateSelectedCategories = useCallback((value: SetStateAction<string[]>) => {
    setSelectedCategories(value)
    setCurrentPage(1)
  }, [])

  const updateSelectedCountries = useCallback((value: SetStateAction<string[]>) => {
    setSelectedCountries(value)
    setCurrentPage(1)
  }, [])

  const updateSelectedJobTypes = useCallback((value: SetStateAction<string[]>) => {
    setSelectedJobTypes(value)
    setCurrentPage(1)
  }, [])

  const updateSelectedLanguages = useCallback((value: SetStateAction<string[]>) => {
    setSelectedLanguages(value)
    setCurrentPage(1)
  }, [])

  const updateSelectedHighlightTiers = useCallback((value: SetStateAction<HighlightTier[]>) => {
    setSelectedHighlightTiers(value)
    setCurrentPage(1)
  }, [])

  const updateAccommodationProvided = useCallback((value: boolean) => {
    setAccommodationProvided(value)
    setCurrentPage(1)
  }, [])

  const updateMinSalary = useCallback((value: string) => {
    setMinSalary(value.replace(/[^\d]/g, ""))
    setCurrentPage(1)
  }, [])

  const updateSalaryCurrency = useCallback((value: string) => {
    setSalaryCurrency(value)
    setCurrentPage(1)
  }, [])

  const categories = useMemo(() => {
    const allCategories = jobs.map((job) => job.category)
    return [...new Set(allCategories)].map((category) => ({
      value: category,
      label: category,
    }))
  }, [jobs])

  const filteredJobs = useMemo(
    () =>
      sortJobs(
        filterJobs(jobs, {
          searchTerm,
          selectedCategories,
          selectedCountries,
          selectedJobTypes,
          selectedLanguages,
          selectedHighlightTiers,
          accommodationProvided,
          minSalary,
          salaryCurrency,
        }),
        sortMode,
      ),
    [
      jobs,
      searchTerm,
      selectedCategories,
      selectedCountries,
      selectedJobTypes,
      selectedLanguages,
      selectedHighlightTiers,
      accommodationProvided,
      minSalary,
      salaryCurrency,
      sortMode,
    ],
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
    setSelectedLanguages([])
    setSelectedHighlightTiers([])
    setAccommodationProvided(false)
    setMinSalary("")
    setSalaryCurrency("any")
    setSortMode("newest")
    setCurrentPage(1)
  }, [])

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedCountries.length > 0 ||
    selectedJobTypes.length > 0 ||
    selectedLanguages.length > 0 ||
    selectedHighlightTiers.length > 0 ||
    accommodationProvided ||
    minSalary.length > 0 ||
    salaryCurrency !== "any" ||
    searchTerm.length > 0

  return {
    searchTerm,
    setSearchTerm: updateSearchTerm,
    selectedCategories,
    setSelectedCategories: updateSelectedCategories,
    selectedCountries,
    setSelectedCountries: updateSelectedCountries,
    selectedJobTypes,
    setSelectedJobTypes: updateSelectedJobTypes,
    selectedLanguages,
    setSelectedLanguages: updateSelectedLanguages,
    selectedHighlightTiers,
    setSelectedHighlightTiers: updateSelectedHighlightTiers,
    accommodationProvided,
    setAccommodationProvided: updateAccommodationProvided,
    minSalary,
    setMinSalary: updateMinSalary,
    salaryCurrency,
    setSalaryCurrency: updateSalaryCurrency,
    sortMode,
    setSortMode,
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
