import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const paymentMigration = readFileSync("db-migrations/payments-and-highlights.sql", "utf8")
const adminMigration = readFileSync("db-migrations/admin-portal-metrics.sql", "utf8")
const contactMigration = readFileSync("db-migrations/job-contact-info.sql", "utf8")
const baseline = readFileSync("db-migrations/00-production-baseline.sql", "utf8")

const incrementalSql = `${paymentMigration}\n${adminMigration}\n${contactMigration}`

for (const column of [
  "id",
  "user_id",
  "job_id",
  "stripe_session_id",
  "tier",
  "amount_cents",
  "currency",
  "status",
  "portal_code",
  "created_at",
]) {
  assert.match(
    incrementalSql,
    new RegExp(`ADD COLUMN IF NOT EXISTS ${column}\\b`, "i"),
    `incremental migrations must add payments.${column}`,
  )
}

for (const column of ["portal_code", "portal_domain", "contact_info"]) {
  assert.match(
    incrementalSql,
    new RegExp(`ADD COLUMN IF NOT EXISTS ${column}\\b`, "i"),
    `incremental migrations must add jobs.${column}`,
  )
}

for (const column of [
  "stripe_session_id",
  "tier",
  "amount_cents",
  "currency",
  "status",
  "portal_code",
]) {
  assert.match(
    baseline,
    new RegExp(`${column}\\b`, "i"),
    `fresh baseline must include payments.${column}`,
  )
}

assert.match(incrementalSql, /CREATE UNIQUE INDEX IF NOT EXISTS payments_stripe_session_id_key/i)
assert.match(incrementalSql, /ADD CONSTRAINT payments_pkey PRIMARY KEY \(id\)/i)
assert.match(incrementalSql, /CREATE POLICY "Users can read own payments"/i)
assert.match(baseline, /storage\.buckets/is)
assert.match(baseline, /storage\.objects/is)
