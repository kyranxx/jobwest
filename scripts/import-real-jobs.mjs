import { existsSync, readFileSync } from "node:fs"
import dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"
import { z } from "zod"

const args = process.argv.slice(2)
const commit = args.includes("--commit")
const allowDuplicates = args.includes("--allow-duplicates")
const validateOnly = args.includes("--validate-only")
const envFile = getArgValue("--env") ?? (existsSync(".env.production.local") ? ".env.production.local" : ".env.local")
const filePath = args.find((arg) => !arg.startsWith("--"))
const portalRegistry = JSON.parse(readFileSync(new URL("../lib/portal-registry.json", import.meta.url), "utf8"))

dotenv.config({ path: envFile, quiet: true })
dotenv.config({ quiet: true })

const jobCategories = [
  "Sklady a logistika",
  "Výroba",
  "Remeslá a stavebníctvo",
  "Gastro a hotely",
  "Opatrovanie",
  "Doprava",
  "Poľnohospodárstvo",
  "IT a kancelária",
]

const jobTypes = ["zivnost", "na-zmluvu", "brigada"]
const placeholderValues = new Set([
  "aaa",
  "asdf",
  "bla bla",
  "blabla",
  "demo",
  "placeholder",
  "qwerty",
  "sample",
  "test",
  "testing",
  "todo",
  "xxx",
])

const jobSchema = z.object({
  company: z.string().trim().min(2),
  contact_info: z.string().trim().min(5),
  title: z.string().trim().min(5),
  description: z.string().trim().min(40),
  category: z.enum(jobCategories),
  country_code: z.string().trim().toLowerCase().regex(/^[a-z]{2}$/),
  location: z.string().trim().min(2),
  salary: z.string().trim().min(3),
  job_type: z.enum(jobTypes),
  accommodation_provided: z.boolean().default(false),
  accommodation_paid: z.boolean().default(false),
  portal_code: z.string().trim().min(2).optional(),
  portal_domain: z.string().trim().min(3).optional(),
})

const jobsSchema = z.array(jobSchema).min(1)

function usage() {
  console.error("Usage: pnpm jobs:import <jobs.json> [--env=.env.production.local] [--validate-only] [--commit] [--allow-duplicates]")
}

function getArgValue(name) {
  const prefix = `${name}=`
  return args.find((arg) => arg.startsWith(prefix))?.slice(prefix.length)
}

function envValue(name) {
  return process.env[name]?.trim()
}

function normalizeText(value) {
  return (value ?? "").trim().replace(/\s+/g, " ").toLowerCase()
}

function isPlaceholderText(value) {
  const text = normalizeText(value)

  if (!text) return true
  if (placeholderValues.has(text)) return true

  return /^(test|demo|sample|todo)\s*(job|ponuka|inzerat|inzerát|company|firma)?\s*\d*$/i.test(text)
}

function assertRealJob(job, index) {
  const label = `Job ${index + 1}`

  for (const field of ["company", "contact_info", "title", "description", "location", "salary"]) {
    if (isPlaceholderText(job[field])) {
      throw new Error(`${label}: ${field} looks like placeholder text`)
    }
  }

  if (/lorem ipsum/i.test(job.description)) {
    throw new Error(`${label}: description contains lorem ipsum`)
  }

  if (!/\b(EUR|CHF|GBP)\b/i.test(job.salary)) {
    throw new Error(`${label}: salary must include EUR, CHF, or GBP`)
  }

  if (!/(@|\+\d{3,}|http|www\.)/i.test(job.contact_info)) {
    throw new Error(`${label}: contact_info must contain an email, phone number, or URL`)
  }

  if (/\bexample\.(com|org|net|invalid)\b|\.example\b/i.test(job.contact_info)) {
    throw new Error(`${label}: contact_info must not use example or placeholder contact domains`)
  }
}

function assertPortalRegistration(job, index) {
  const label = `Job ${index + 1}`
  const portal = portalRegistry.find((item) => item.code === job.portal_code)

  if (!portal) {
    throw new Error(`${label}: portal_code ${job.portal_code} is not registered in lib/portal-registry.json`)
  }

  if (job.portal_domain !== portal.domain) {
    throw new Error(`${label}: portal_domain ${job.portal_domain} does not match ${job.portal_code} (${portal.domain})`)
  }
}

function duplicateKey(job) {
  return [job.portal_code, job.company, job.title, job.country_code, job.location]
    .map(normalizeText)
    .join("|")
}

if (!filePath) {
  usage()
  process.exit(1)
}

if (!existsSync(filePath)) {
  console.error(`Input file not found: ${filePath}`)
  process.exit(1)
}

let parsed
try {
  parsed = JSON.parse(readFileSync(filePath, "utf8"))
} catch (error) {
  console.error(`Invalid JSON: ${error instanceof Error ? error.message : error}`)
  process.exit(1)
}

let jobs
try {
  jobs = jobsSchema.parse(parsed).map((job) => ({
    ...job,
    portal_code: job.portal_code ?? envValue("NEXT_PUBLIC_PORTAL_CODE") ?? "sk",
    portal_domain: job.portal_domain ?? envValue("NEXT_PUBLIC_PORTAL_DOMAIN") ?? "jobwest.sk",
  }))

  jobs.forEach(assertRealJob)
  jobs.forEach(assertPortalRegistration)
} catch (error) {
  console.error(error instanceof z.ZodError ? error.errors : error)
  process.exit(1)
}

const inputDuplicates = new Set()
for (const job of jobs) {
  const key = duplicateKey(job)
  if (inputDuplicates.has(key)) {
    console.error(`Duplicate in input: ${job.company} / ${job.title} / ${job.country_code}`)
    process.exit(1)
  }
  inputDuplicates.add(key)
}

if (validateOnly) {
  console.log(`Validation OK: ${jobs.length} real job ads checked locally. Supabase was not contacted.`)
  process.exit(0)
}

const supabaseUrl = envValue("NEXT_PUBLIC_SUPABASE_URL")
const serviceRoleKey = envValue("SUPABASE_SERVICE_ROLE_KEY")

if (!supabaseUrl || !serviceRoleKey) {
  console.error(`Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in ${envFile}`)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

if (!allowDuplicates) {
  const portalCodes = [...new Set(jobs.map((job) => job.portal_code))]
  const { data: existingJobs, error } = await supabase
    .from("jobs")
    .select("company,title,country_code,location,portal_code")
    .in("portal_code", portalCodes)
    .limit(2000)

  if (error) {
    console.error(`Could not check existing jobs: ${error.message}`)
    process.exit(1)
  }

  const existingKeys = new Set((existingJobs ?? []).map(duplicateKey))
  const duplicate = jobs.find((job) => existingKeys.has(duplicateKey(job)))

  if (duplicate) {
    console.error(`Duplicate already exists: ${duplicate.company} / ${duplicate.title} / ${duplicate.country_code}`)
    process.exit(1)
  }
}

const rows = jobs.map((job) => ({
  user_id: null,
  company: job.company,
  contact_info: job.contact_info,
  title: job.title,
  description: job.description,
  category: job.category,
  salary: job.salary,
  country_code: job.country_code,
  location: job.location,
  portal_code: job.portal_code,
  portal_domain: job.portal_domain,
  accommodation_provided: job.accommodation_provided,
  accommodation_included: job.accommodation_provided,
  accommodation_paid: job.accommodation_paid,
  is_top: false,
  highlight_tier: "standard",
  job_type: job.job_type,
}))

if (!commit) {
  console.log(`Dry run OK: ${rows.length} real job ads validated for ${supabaseUrl}. Add --commit to insert.`)
  process.exit(0)
}

const { error } = await supabase.from("jobs").insert(rows)

if (error) {
  console.error(`Import failed: ${error.message}`)
  process.exit(1)
}

console.log(`Imported ${rows.length} real job ads.`)
