import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"

const baseline = readFileSync("db-migrations/00-production-baseline.sql", "utf8")
const validationMigrationPath = "db-migrations/job-ad-validation-constraints.sql"

assert.equal(
  existsSync(validationMigrationPath),
  true,
  "incremental migration must enforce job ad validation for existing production databases",
)

const validationMigration = existsSync(validationMigrationPath)
  ? readFileSync(validationMigrationPath, "utf8")
  : ""
const sql = `${baseline}\n${validationMigration}`

for (const [constraintName, expectedPattern] of [
  ["jobs_company_required", /company IS NOT NULL[\s\S]*length\(btrim\(company\)\) >= 2/i],
  ["jobs_contact_info_required", /contact_info IS NOT NULL[\s\S]*contact_info ~\* '\(@\|\\\+\[0-9\]\{3,\}\|http\|www\\\.\)'/i],
  ["jobs_title_required", /title IS NOT NULL[\s\S]*length\(btrim\(title\)\) >= 5/i],
  ["jobs_description_required", /description IS NOT NULL[\s\S]*length\(btrim\(description\)\) >= 40/i],
  ["jobs_category_required", /category IS NOT NULL[\s\S]*length\(btrim\(category\)\) >= 1/i],
  ["jobs_country_code_required", /country_code IS NOT NULL[\s\S]*length\(btrim\(country_code\)\) >= 1/i],
  ["jobs_location_required", /location IS NOT NULL[\s\S]*length\(btrim\(location\)\) >= 2/i],
  ["jobs_salary_required", /salary IS NOT NULL[\s\S]*salary ~\* '\\b\(EUR\|CHF\|GBP\)\\b'/i],
  ["jobs_job_type_required", /job_type IS NOT NULL[\s\S]*length\(btrim\(job_type\)\) >= 1/i],
]) {
  assert.match(sql, new RegExp(`CONSTRAINT ${constraintName}`, "i"))
  assert.match(sql, expectedPattern, `${constraintName} must mirror the public job form validation`)
}

assert.match(
  validationMigration,
  /NOT VALID/i,
  "incremental constraints must protect new writes without failing deployment on old dirty rows",
)
