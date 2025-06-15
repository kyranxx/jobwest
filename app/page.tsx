"use client"

import type React from "react"

import { useState } from "react"
import { BookmarkPlus, Bookmark, LayoutGrid, ListFilter, Plus, Search, User } from "lucide-react"
import Image from "next/image"

import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export default function JobPortal() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [savedJobs, setSavedJobs] = useState<number[]>([])
  const [selectedJob, setSelectedJob] = useState<number | null>(null)

  // Country data with flags
  const countries = [
    { code: "de", name: "Nemecko", flag: "/flags/germany.png" },
    { code: "at", name: "Rakúsko", flag: "/flags/austria.png" },
    { code: "nl", name: "Holandsko", flag: "/flags/netherlands.png" },
    { code: "uk", name: "Spojené kráľovstvo", flag: "/flags/uk.png" },
    { code: "us", name: "USA", flag: "/flags/usa.png" },
  ]

  // Job types
  const jobTypes = [
    { id: "zivnost", label: "Živnosť" },
    { id: "zmluva", label: "Na zmluvu" },
    { id: "brigada", label: "Brigáda" },
    { id: "ine", label: "Iné" },
  ]

  // Mock data for job listings
  const jobs = Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    title: ["Frontend Developer", "UX Dizajnér", "Produktový Manažér", "Dátový Vedec", "DevOps Inžinier"][i % 5],
    country: countries[i % 5],
    category: ["IT", "Dizajn", "Marketing", "Financie", "Strojárstvo"][i % 5],
    jobType: ["Živnosť", "Na zmluvu", "Brigáda", "Iné", "Živnosť"][i % 5],
    salary: ["3000€ - 4500€", "2500€ - 3200€", "2800€ - 3500€", "3200€ - 4000€", "2700€ - 3300€"][i % 5],
    isTop: i < 12,
  }))

  const toggleSaveJob = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const isSaving = !savedJobs.includes(id)
    setSavedJobs((prev) => (isSaving ? [...prev, id] : prev.filter((jobId) => jobId !== id)))
    if (isSaving) {
      toast.success("Pracovná ponuka bola uložená.")
    } else {
      toast.warning("Pracovná ponuka bola odstránená z uložených.")
    }
  }

  const handleJobClick = (id: number) => {
    setSelectedJob(id)
    // In a real app, this would navigate to the job detail page or open a modal
    console.log(`Job ${id} clicked`)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Container with max width and centered */}
      <div className="max-w-screen-2xl mx-auto w-full">
        {/* Top banner */}
        <header className="h-16 border-b bg-white px-4 py-2 flex items-center justify-between">
          <div className="flex items-center">
            <div>
              <Image src="/logo.png" alt="JobWest Logo" width={120} height={40} className="h-10 w-auto" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="default"
              size="icon"
              className="rounded-md h-10 w-10 bg-black hover:bg-gray-800"
              title="Pridať inzerát"
              onClick={() => toast.info("Táto funkcia ešte nebola implementovaná.")}
            >
              <Plus className="h-5 w-5" />
              <span className="sr-only">Pridať inzerát</span>
            </Button>
            <Button
              variant="default"
              size="icon"
              className="rounded-md h-10 w-10 bg-black hover:bg-gray-800"
              title="Prihlásiť"
              onClick={() => toast.info("Táto funkcia ešte nebola implementovaná.")}
            >
              <User className="h-5 w-5" />
              <span className="sr-only">Prihlásiť</span>
            </Button>
          </div>
        </header>

        {/* Main content with sidebar */}
        <div className="flex flex-grow">
          {/* Left sidebar with filters */}
          <aside className="w-64 bg-white border-r p-4 hidden md:block">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Vyhľadávanie</h3>
                <Button
                  variant="default"
                  size="icon"
                  className="rounded-full h-8 w-8 bg-black hover:bg-gray-800"
                  onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                  title={viewMode === "grid" ? "Zobraziť zoznam" : "Zobraziť mriežku"}
                >
                  {viewMode === "grid" ? <ListFilter className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
                  <span className="sr-only">Zmeniť zobrazenie</span>
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Hľadať pracovné ponuky..." className="pl-8 h-9" />
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Kategória</h3>
                <Select>
                  <SelectTrigger className="w-full h-9">
                    <SelectValue placeholder="Kategória" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Všetky kategórie</SelectItem>
                    <SelectItem value="it">IT</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="finance">Financie</SelectItem>
                    <SelectItem value="engineering">Strojárstvo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Krajina</h3>
                <Select>
                  <SelectTrigger className="w-full h-9">
                    <SelectValue placeholder="Krajina" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Všetky krajiny</SelectItem>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-3 bg-gray-200 rounded-sm overflow-hidden flex items-center justify-center text-[8px]">
                            {country.code.toUpperCase()}
                          </div>
                          <span>{country.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Typ práce</h3>
                <div className="space-y-2">
                  {jobTypes.map((type) => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <Checkbox id={`job-type-${type.id}`} />
                      <Label htmlFor={`job-type-${type.id}`} className="text-sm font-normal">
                        {type.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Ubytovanie</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="accommodation-provided" />
                    <Label htmlFor="accommodation-provided" className="text-sm font-normal">
                      Vybavené
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="accommodation-paid" />
                    <Label htmlFor="accommodation-paid" className="text-sm font-normal">
                      Hradené
                    </Label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Fakturácia</h3>
                <Input type="number" placeholder="Počet dní" className="h-9" />
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Splatnosť</h3>
                <Input type="number" placeholder="Počet dní" className="h-9" />
              </div>
            </div>
          </aside>

          {/* Mobile filter bar - only visible on small screens */}
          <div className="md:hidden border-b bg-white px-4 py-3 flex flex-wrap items-center gap-3 w-full">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Hľadať pracovné ponuky..." className="pl-8 h-9 rounded-full" />
            </div>

            <Button variant="outline" size="sm" className="rounded-full h-9">
              <ListFilter className="h-4 w-4 mr-2" />
              Filtre
            </Button>
          </div>

          {/* Main content area */}
          <main className="flex-grow p-6">
            {/* Job listings */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white rounded-lg overflow-hidden border-2 border-gray-200 hover:shadow-sm transition-shadow cursor-pointer"
                    onClick={() => handleJobClick(job.id)}
                  >
                    <div className="p-3 pb-1 relative">
                      {job.isTop && (
                        <Badge className="absolute top-2 left-2 bg-black text-white text-xs font-medium px-2 py-0.5 rounded-sm pointer-events-none">
                          TOP
                        </Badge>
                      )}
                      <div className="absolute top-2 right-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={(e) => toggleSaveJob(job.id, e)}
                          title="Uložiť ponuku"
                        >
                          {savedJobs.includes(job.id) ? (
                            <Bookmark className="h-5 w-5 text-[#0000FF]" fill="#0000FF" />
                          ) : (
                            <BookmarkPlus className="h-5 w-5" />
                          )}
                          <span className="sr-only">Uložiť ponuku</span>
                        </Button>
                      </div>
                      <div className="mt-8">
                        <h3 className="font-medium text-sm">{job.title}</h3>
                        <div className="flex items-center mt-2 gap-2">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 rounded-sm bg-gray-50">
                            {job.jobType}
                          </Badge>
                          <div className="w-5 h-3 bg-gray-200 rounded-sm overflow-hidden flex items-center justify-center text-[8px]">
                            {job.country.code.toUpperCase()}
                          </div>
                        </div>
                        <p className="text-xs font-medium mt-2">{job.salary}</p>
                      </div>
                    </div>
                    <div className="h-[1px] bg-gray-100 mx-3 my-2"></div>
                    <div className="px-3 pb-3 flex justify-between items-center">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 rounded-sm bg-gray-50">
                        {job.category}
                      </Badge>
                      <span className="text-[10px] text-gray-400">12.06.2025</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white rounded-lg overflow-hidden border-2 border-gray-200 hover:shadow-sm transition-shadow cursor-pointer"
                    onClick={() => handleJobClick(job.id)}
                  >
                    <div className="p-4 flex justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{job.title}</h3>
                          {job.isTop && (
                            <Badge className="bg-black text-white text-xs font-medium px-2 py-0.5 pointer-events-none">
                              TOP
                            </Badge>
                          )}
                          <div className="w-6 h-4 bg-gray-200 rounded-sm overflow-hidden flex items-center justify-center text-[8px] font-bold">
                            {job.country.code.toUpperCase()}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs px-2 py-0.5 rounded-sm bg-gray-50">
                            {job.jobType}
                          </Badge>
                          <Badge variant="outline" className="text-xs px-2 py-0.5 rounded-sm bg-gray-50">
                            {job.category}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium mt-2">{job.salary}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 rounded-full"
                          onClick={(e) => toggleSaveJob(job.id, e)}
                          title="Uložiť ponuku"
                        >
                          {savedJobs.includes(job.id) ? (
                            <Bookmark className="h-6 w-6 text-[#0000FF]" fill="#0000FF" />
                          ) : (
                            <BookmarkPlus className="h-6 w-6" />
                          )}
                          <span className="sr-only">Uložiť ponuku</span>
                        </Button>
                        <span className="text-xs text-gray-400">12.06.2025</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            <div className="flex justify-center mt-8">
              <nav className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-md">
                  <span className="sr-only">Predchádzajúca strana</span>
                  <span>{"<"}</span>
                </Button>
                <Button variant="outline" size="sm" className="h-8 w-8 rounded-md bg-gray-100">
                  1
                </Button>
                <Button variant="outline" size="sm" className="h-8 w-8 rounded-md">
                  2
                </Button>
                <Button variant="outline" size="sm" className="h-8 w-8 rounded-md">
                  3
                </Button>
                <span className="px-2">...</span>
                <Button variant="outline" size="sm" className="h-8 w-8 rounded-md">
                  8
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-md">
                  <span className="sr-only">Nasledujúca strana</span>
                  <span>{">"}</span>
                </Button>
              </nav>
            </div>
          </main>
        </div>
      </div>

      {/* Footer */}
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
  )
}
