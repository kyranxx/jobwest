import assert from "node:assert/strict"
import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { spawnSync } from "node:child_process"

const tempDir = mkdtempSync(join(tmpdir(), "jobwest-import-test-"))

try {
  const env = {
    ...process.env,
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_SERVICE_ROLE_KEY: "test-service-role",
    NEXT_PUBLIC_PORTAL_CODE: "sk",
    NEXT_PUBLIC_PORTAL_DOMAIN: "jobwest.sk",
  }

  const validJob = {
    company: "Real Agency s.r.o.",
    contact_info: "jobs@real-agency.sk",
    title: "Skladnik v Nemecku",
    description: "Overena pracovna ponuka s jasnou mzdou, nastupom, ubytovanim a kontaktom pre uchadzacov.",
    category: "Sklady a logistika",
    country_code: "de",
    location: "Mnichov",
    salary: "2200 EUR/mesiac",
    job_type: "na-zmluvu",
    accommodation_provided: true,
    accommodation_paid: false,
  }

  function writeJobs(name: string, jobs: unknown) {
    const file = join(tempDir, name)
    writeFileSync(file, JSON.stringify(jobs))
    return file
  }

  function runImporter(file: string) {
    return spawnSync(process.execPath, ["scripts/import-real-jobs.mjs", file, "--allow-duplicates"], {
      cwd: process.cwd(),
      env,
      encoding: "utf8",
    })
  }

  function runLocalValidation(file: string) {
    return spawnSync(process.execPath, ["scripts/import-real-jobs.mjs", file, "--validate-only"], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        NEXT_PUBLIC_SUPABASE_URL: "",
        SUPABASE_SERVICE_ROLE_KEY: "",
        NEXT_PUBLIC_PORTAL_CODE: "sk",
        NEXT_PUBLIC_PORTAL_DOMAIN: "jobwest.sk",
      },
      encoding: "utf8",
    })
  }

  const validRun = runImporter(writeJobs("valid-jobs.json", [validJob]))

  assert.equal(validRun.status, 0, validRun.stderr)
  assert.match(validRun.stdout, /Dry run OK: 1 real job ads validated/)

  const localValidationRun = runLocalValidation(writeJobs("local-validation-jobs.json", [validJob]))

  assert.equal(localValidationRun.status, 0, localValidationRun.stderr)
  assert.match(localValidationRun.stdout, /Validation OK: 1 real job ads checked locally/)

  const placeholderRun = runImporter(
    writeJobs("placeholder-jobs.json", [
      {
        ...validJob,
        company: "Demo",
      },
    ]),
  )

  assert.notEqual(placeholderRun.status, 0)
  assert.match(placeholderRun.stderr, /company looks like placeholder text/)

  const badSalaryRun = runImporter(
    writeJobs("bad-salary-jobs.json", [
      {
        ...validJob,
        salary: "2200",
      },
    ]),
  )

  assert.notEqual(badSalaryRun.status, 0)
  assert.match(badSalaryRun.stderr, /salary must include EUR, CHF, or GBP/)

  const badContactRun = runImporter(
    writeJobs("bad-contact-jobs.json", [
      {
        ...validJob,
        contact_info: "kontakt",
      },
    ]),
  )

  assert.notEqual(badContactRun.status, 0)
  assert.match(badContactRun.stderr, /contact_info must contain an email, phone number, or URL/)

  const placeholderContactRun = runImporter(
    writeJobs("placeholder-contact-jobs.json", [
      {
        ...validJob,
        contact_info: "jobs@example.com",
      },
    ]),
  )

  assert.notEqual(placeholderContactRun.status, 0)
  assert.match(placeholderContactRun.stderr, /must not use example or placeholder contact domains/)

  const badPortalRun = runImporter(
    writeJobs("bad-portal-jobs.json", [
      {
        ...validJob,
        portal_code: "hu",
        portal_domain: "jobwest.sk",
      },
    ]),
  )

  assert.notEqual(badPortalRun.status, 0)
  assert.match(badPortalRun.stderr, /portal_domain jobwest.sk does not match hu/)

  const duplicateRun = runImporter(writeJobs("duplicate-jobs.json", [validJob, validJob]))

  assert.notEqual(duplicateRun.status, 0)
  assert.match(duplicateRun.stderr, /Duplicate in input/)

  const emptyRun = runImporter(writeJobs("empty-jobs.json", []))

  assert.notEqual(emptyRun.status, 0)
  assert.match(emptyRun.stderr, /at least 1 element/)
} finally {
  rmSync(tempDir, { recursive: true, force: true })
}
