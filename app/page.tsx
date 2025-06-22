"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { BookmarkPlus, Bookmark, LayoutGrid, ListFilter, Plus, Search, User, X, RotateCcw } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { UserButton } from "@/components/auth/user-button"
import { AddAdButton } from "@/components/auth/add-ad-button"
import { Input } from "@/components/ui/input"
import { MultiSelect } from "@/components/ui/multi-select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import JobDetail from "@/components/ui/job-detail"
import { supabase } from "@/lib/supabase"
import { Job } from "@/lib/types"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { generateNonce, hashNonce } from "@/lib/utils/nonce"

function JobSearchPortal() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [savedJobs, setSavedJobs] = useState<number[]>([])
  const [selectedJob, setSelectedJob] = useState<number | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([])
  const [isAccommodationProvided, setIsAccommodationProvided] = useState(false)
  const [isAccommodationPaid, setIsAccommodationPaid] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(16)

  useEffect(() => {
    if (viewMode === 'grid') {
      setItemsPerPage(16);
    } else {
      setItemsPerPage(15);
    }
  }, [viewMode]);

  const countries = useMemo(() => [
    { code: "de", name: "Nemecko" },
    { code: "fr", name: "Francúzsko" },
    { code: "es", name: "Španielsko" },
    { code: "gb", name: "V. Británia" },
    { code: "ie", name: "Írsko" },
    { code: "dk", name: "Dánsko" },
    { code: "se", name: "Švédsko" },
    { code: "it", name: "Taliansko" },
    { code: "no", name: "Nórsko" },
    { code: "fi", name: "Fínsko" },
    { code: "at", name: "Rakúsko" },
    { code: "ch", name: "Švajčiarsko" },
    { code: "us", name: "USA" },
  ], [])

  const jobTypes = [
    { id: "zivnost", label: "Živnosť" },
    { id: "zmluva", label: "Na zmluvu" },
    { id: "brigada", label: "Brigáda" },
    { id: "ine", label: "Iné" },
  ]

  useEffect(() => {
    const fetchJobs = async () => {
      const { data, error } = await supabase.from('jobs').select('*')
      if (error) {
        console.error('Error fetching jobs:', error)
      } else {
        let formattedJobs = data.map((job: any, index: number) => {
          const country = countries.find(c => c.code === job.country_code);
          return {
            ...job,
            country: country ? { code: country.code, name: country.name } : undefined,
            jobType: job.job_type,
            isTop: index < 15,
            created_at: new Date(new Date().getTime() - index * 1000 * 60 * 60 * 24).toISOString(),
          };
        });
        setJobs(formattedJobs)
      }
    }

    fetchJobs()
  }, [countries])

  useEffect(() => {
    let tempJobs = jobs
    if (searchTerm) {
      tempJobs = tempJobs.filter(job => job.title.toLowerCase().includes(searchTerm.toLowerCase()))
    }
    if (selectedCategories.length > 0) {
      tempJobs = tempJobs.filter(job => selectedCategories.includes(job.category.toLowerCase()))
    }
    if (selectedCountries.length > 0) {
      tempJobs = tempJobs.filter(job => job.country?.code && selectedCountries.includes(job.country.code))
    }
    if (selectedJobTypes.length > 0) {
      tempJobs = tempJobs.filter(job => {
        const jobType = job.jobType || "";
        const jobTypeObject = jobTypes.find(jt => jt.label === jobType);
        return jobTypeObject && selectedJobTypes.includes(jobTypeObject.id);
      })
    }
    if (isAccommodationProvided) {
      tempJobs = tempJobs.filter(job => job.accommodation_provided);
    }
    if (isAccommodationPaid) {
      tempJobs = tempJobs.filter(job => job.accommodation_paid);
    }
    tempJobs.sort((a, b) => {
      if (a.isTop && !b.isTop) return -1;
      if (!a.isTop && b.isTop) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    setFilteredJobs(tempJobs)
    setCurrentPage(1)
  }, [jobs, searchTerm, selectedCategories, selectedCountries, selectedJobTypes, isAccommodationProvided, isAccommodationPaid])

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
  }

  const handleBackToList = () => {
    setSelectedJob(null)
  }

  const resetFilters = () => {
    setSearchTerm("")
    setSelectedCategories([])
    setSelectedCountries([])
    setSelectedJobTypes([])
    setIsAccommodationProvided(false)
    setIsAccommodationPaid(false)
  }

  const selectedJobDetails = selectedJob ? jobs.find((job) => job.id === selectedJob) : null
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage)
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const getOfferText = (count: number) => {
    if (count === 1) return "ponuka";
    if (count >= 2 && count <= 4) return "ponuky";
    return "ponúk";
  };

  return (
    <>
      <div className="flex flex-grow">
        <aside className="w-64 bg-white border-r p-4 hidden md:flex flex-col flex-shrink-0">
          <div className="flex-grow space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">
                {filteredJobs.length} {getOfferText(filteredJobs.length)}
              </h3>
              <div className="flex items-center gap-2">
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
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Hľadať pracovné ponuky..."
                className="pl-8 h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Pracovná pozícia</h3>
              <MultiSelect
                options={[
                  { value: "it", label: "IT" },
                  { value: "marketing", label: "Marketing" },
                  { value: "finance", label: "Financie" },
                  { value: "engineering", label: "Strojárstvo" },
                ]}
                selected={selectedCategories}
                onChange={setSelectedCategories}
                placeholder="Všetky pozície"
                className="w-full h-9"
              />
              <div className="flex flex-wrap gap-1">
                {selectedCategories.map((category) => (
                  <Badge key={category} variant="secondary" className="flex items-center gap-1 capitalize text-sm">
                    {category}
                    <button onClick={() => setSelectedCategories(prev => prev.filter(item => item !== category))} className="ml-1 rounded-full hover:bg-gray-300 p-0.5">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Krajina</h3>
              <MultiSelect
                options={countries.map(c => ({ value: c.code, label: c.name, flag: c.code }))}
                selected={selectedCountries}
                onChange={setSelectedCountries}
                placeholder="Všetky krajiny"
                className="w-full h-9"
              />
              <div className="flex flex-wrap gap-1">
                {selectedCountries.map((countryCode) => {
                  const country = countries.find(c => c.code === countryCode);
                  return (
                    <Badge key={countryCode} variant="secondary" className="flex items-center gap-1 text-sm">
                      {country?.name}
                      <button onClick={() => setSelectedCountries(prev => prev.filter(item => item !== countryCode))} className="ml-1 rounded-full hover:bg-gray-300 p-0.5">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )
                })}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Typ práce</h3>
              <div className="space-y-2">
                {jobTypes.map((type) => (
                  <div key={type.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`job-type-${type.id}`}
                      checked={selectedJobTypes.includes(type.id)}
                      onCheckedChange={(checked) => {
                        setSelectedJobTypes(prev =>
                          checked
                            ? [...prev, type.id]
                            : prev.filter(item => item !== type.id)
                        )
                      }}
                    />
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
                  <Checkbox
                    id="accommodation-provided"
                    checked={isAccommodationProvided}
                    onCheckedChange={(checked) => setIsAccommodationProvided(Boolean(checked))}
                  />
                  <Label htmlFor="accommodation-provided" className="text-sm font-normal">
                    Vybavené
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="accommodation-paid"
                    checked={isAccommodationPaid}
                    onCheckedChange={(checked) => setIsAccommodationPaid(Boolean(checked))}
                  />
                  <Label htmlFor="accommodation-paid" className="text-sm font-normal">
                    Hradené
                  </Label>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Button
                variant="default"
                size="lg"
                className="w-full bg-black hover:bg-gray-800 text-white"
                onClick={resetFilters}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Resetovať filtre
              </Button>
            </div>
          </div>
        </aside>
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
        <main className="flex-grow p-6">
          {selectedJobDetails ? (
            <JobDetail job={selectedJobDetails} onBack={handleBackToList} />
          ) : (
            <>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {paginatedJobs.map((job) => (
                    <div
                      key={job.id}
                      className="bg-white rounded-lg overflow-hidden border-2 border-gray-200 hover:shadow-sm transition-shadow cursor-pointer hover:bg-gray-100 flex flex-col"
                      onClick={() => handleJobClick(job.id)}
                    >
                      <div className="p-3 pb-2 flex-grow h-full">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-base pr-2">
                            {job.title.length > 50 ? `${job.title.substring(0, 50)}...` : job.title}
                          </h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full flex-shrink-0 hover:bg-gray-200"
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
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {job.country && (
                            <div className="flex items-center gap-2">
                              <div className={`flag flag-${job.country.code}`} />
                              <span className="text-sm">{job.country.name}</span>
                            </div>
                          )}
                          {job.isTop && (
                            <Badge className="bg-black text-white text-xs font-medium px-2 py-0.5 rounded-sm">
                              TOP
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 rounded-sm bg-gray-50">
                            {job.jobType}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium mt-2">{job.salary}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          {job.description.length > 150 ? `${job.description.substring(0, 150)}...` : job.description}
                        </p>
                      </div>
                      <div className="flex justify-between items-center mt-auto p-3 pt-0">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 rounded-sm bg-gray-50">
                          {job.category}
                        </Badge>
                        <span className="text-[10px] text-gray-400">12.06.2025</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {paginatedJobs.map((job) => (
                    <div
                      key={job.id}
                      className="bg-white rounded-lg overflow-hidden border-2 border-gray-200 hover:shadow-sm transition-shadow cursor-pointer flex hover:bg-gray-100 h-40"
                      onClick={() => handleJobClick(job.id)}
                    >
                      <div className="p-4 flex flex-col w-[400px] flex-shrink-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-lg">
                            {job.title.length > 50 ? `${job.title.substring(0, 50)}...` : job.title}
                          </h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {job.country && (
                            <div className="flex items-center gap-2">
                              <div className={`flag flag-${job.country.code}`} />
                              <span className="text-xs">{job.country.name}</span>
                            </div>
                          )}
                          {job.isTop && (
                            <Badge className="bg-black text-white text-xs font-medium px-2 py-0.5 rounded-sm">
                              TOP
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs px-2 py-0.5 rounded-sm bg-gray-50">
                            {job.jobType}
                          </Badge>
                          <Badge variant="outline" className="text-xs px-2 py-0.5 rounded-sm bg-gray-50">
                            {job.category}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium mt-2">{job.salary}</p>
                      </div>
                      <div className="p-4 flex-1 flex items-start justify-start">
                        <p className="text-base text-gray-600 text-left">
                          {job.description.length > 150 ? `${job.description.substring(0, 150)}...` : job.description}
                        </p>
                      </div>
                      <div className="p-4 flex flex-col items-end justify-between">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 rounded-full hover:bg-gray-200"
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
                        <span className="text-xs text-gray-400 mt-auto">12.06.2025</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-center mt-8">
                <nav className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-md"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <span className="sr-only">Predchádzajúca strana</span>
                    <span>{"<"}</span>
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant="outline"
                      size="sm"
                      className={`h-8 w-8 rounded-md ${currentPage === page ? "bg-gray-100" : ""}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-md"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <span className="sr-only">Nasledujúca strana</span>
                    <span>{">"}</span>
                  </Button>
                </nav>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  )
}

function Dashboard({ setView }: { setView: (view: string) => void }) {
  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  return (
    <div className="flex flex-grow">
      <aside className="w-64 bg-gray-100 p-4">
        <nav className="flex flex-col space-y-2">
          <button onClick={() => setView("dashboard")} className="font-bold text-left">Účet</button>
          <button onClick={() => setView("add-ad")} className="text-left">Pridať inzerát</button>
          <button onClick={() => setView("ads")} className="text-left">Moje inzeráty</button>
          <button onClick={() => setView("payments")} className="text-left">Moje platby</button>
          <button onClick={() => setView("settings")} className="text-left">Nastavenia</button>
        </nav>
      </aside>
      <main className="flex-grow p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Účet</h1>
          <Button onClick={handleLogout} variant="outline">Odhlásiť sa</Button>
        </div>
        <p>Vitajte na vašom účte.</p>
      </main>
    </div>
  )
}

function AddAdPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  const handleAddAd = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { error } = await supabase.from("ads").insert({
        user_id: user.id,
        title,
        description,
      })
      if (error) {
        toast.error(error.message)
      } else {
        toast.success("Inzerát bol pridaný!")
        setTitle("")
        setDescription("")
      }
    }
  }

  return (
    <div className="flex flex-grow">
      <aside className="w-64 bg-gray-100 p-4">
        <nav className="flex flex-col space-y-2">
          <Link href="/" className="font-bold">Nástenka</Link>
          <Link href="/add-ad">Pridať inzerát</Link>
          <Link href="/ads">Moje inzeráty</Link>
          <Link href="/payments">Moje platby</Link>
          <Link href="/settings">Nastavenia</Link>
        </nav>
      </aside>
      <main className="flex-grow p-6">
        <h1 className="text-2xl font-bold">Pridať nový inzerát</h1>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Titulok
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Popis
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
          <Button onClick={handleAddAd} className="w-full">
            Pridať inzerát
          </Button>
        </div>
      </main>
    </div>
  )
}

function AdsPage({ ads }: { ads: any[] }) {
  return (
    <div className="flex flex-grow">
      <aside className="w-64 bg-gray-100 p-4">
        <nav className="flex flex-col space-y-2">
          <Link href="/" className="font-bold">Nástenka</Link>
          <Link href="/add-ad">Pridať inzerát</Link>
          <Link href="/ads">Moje inzeráty</Link>
          <Link href="/payments">Moje platby</Link>
          <Link href="/settings">Nastavenia</Link>
        </nav>
      </aside>
      <main className="flex-grow p-6">
        <h1 className="text-2xl font-bold">Moje inzeráty</h1>
        <div className="grid gap-4 py-4">
          {ads.map((ad) => (
            <div key={ad.id} className="border p-4 rounded-lg">
              <h2 className="text-xl font-bold">{ad.title}</h2>
              <p>{ad.description}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

function SettingsPage() {
  const handleDeleteAccount = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { error } = await supabase.auth.admin.deleteUser(user.id)
      if (error) {
        toast.error(error.message)
      } else {
        toast.success("Účet bol zmazaný!")
      }
    }
  }

  return (
    <div className="flex flex-grow">
      <aside className="w-64 bg-gray-100 p-4">
        <nav className="flex flex-col space-y-2">
          <Link href="/" className="font-bold">Nástenka</Link>
          <Link href="/add-ad">Pridať inzerát</Link>
          <Link href="/ads">Moje inzeráty</Link>
          <Link href="/payments">Moje platby</Link>
          <Link href="/settings">Nastavenia</Link>
        </nav>
      </aside>
      <main className="flex-grow p-6">
        <h1 className="text-2xl font-bold">Nastavenia</h1>
        <div className="grid gap-4 py-4">
          <Button onClick={handleDeleteAccount} variant="destructive">
            Zmazať účet
          </Button>
        </div>
      </main>
    </div>
  )
}

function PaymentsPage() {
  return (
    <div className="flex flex-grow">
      <aside className="w-64 bg-gray-100 p-4">
        <nav className="flex flex-col space-y-2">
          <Link href="/" className="font-bold">Nástenka</Link>
          <Link href="/add-ad">Pridať inzerát</Link>
          <Link href="/ads">Moje inzeráty</Link>
          <Link href="/payments">Moje platby</Link>
          <Link href="/settings">Nastavenia</Link>
        </nav>
      </aside>
      <main className="flex-grow p-6">
        <h1 className="text-2xl font-bold">Moje platby</h1>
        <p>Tu bude sekcia pre kontrolu platieb.</p>
      </main>
    </div>
  )
}


export default function JobPortalPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [view, setView] = useState("jobs") // 'jobs', 'dashboard', 'add-ad', etc.
  const [ads, setAds] = useState<any[]>([])

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        if (!session?.user) {
          setView("jobs")
        }
      }
    )
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const initializeGoogleOneTap = async () => {
      if (window.google?.accounts?.id) {
        const nonce = generateNonce();
        const hashedNonce = await hashNonce(nonce);

        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          callback: async (response: any) => {
            const { error } = await supabase.auth.signInWithIdToken({
              provider: "google",
              token: response.credential,
              nonce,
            })
            if (error) {
              toast.error(error.message)
            } else {
              toast.success("Prihlásenie úspešné!")
            }
          },
          nonce: hashedNonce,
          use_fedcm_for_prompt: true,
          auto_select: true,
        })
        window.google.accounts.id.prompt()
      }
    }

    if (user) {
      const fetchAds = async () => {
        const { data, error } = await supabase
          .from("ads")
          .select("*")
          .eq("user_id", user.id)
        if (error) {
          console.error("Error fetching ads:", error)
        } else {
          setAds(data)
        }
      }
      fetchAds()
    } else {
      if (window.google) {
        initializeGoogleOneTap()
      } else {
        const script = document.getElementById('google-gsi-client')
        if (script) {
          script.onload = initializeGoogleOneTap
        }
      }
    }
  }, [user])


  const handleLogoClick = () => {
    setView("jobs")
  }

  const renderContent = () => {
    if (user && view !== "jobs") {
      switch (view) {
        case "dashboard":
          return <Dashboard setView={setView} />
        case "add-ad":
          return <AddAdPage />
        case "ads":
          return <AdsPage ads={ads} />
        case "settings":
          return <SettingsPage />
        case "payments":
          return <PaymentsPage />
        default:
          return <Dashboard setView={setView} />
      }
    }
    return <JobSearchPortal />
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="max-w-screen-2xl mx-auto w-full">
        <header className="h-16 border-b bg-white px-4 py-2 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={handleLogoClick}>
              <Image src="/logo.png" alt="JobWest Logo" width={150} height={50} className="h-12 w-auto" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <AddAdButton setView={setView} />
            <UserButton setView={setView} data-cy="user-button" />
            <div id="google-one-tap"></div>
          </div>
        </header>
        {renderContent()}
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
  )
}
