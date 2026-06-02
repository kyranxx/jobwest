import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const sql = readFileSync("db-migrations/00-production-baseline.sql", "utf8")
const profileTriggerSql = readFileSync("db-migrations/auth-user-profile-trigger.sql", "utf8")

for (const table of ["public.users", "public.jobs", "public.payments"]) {
  assert.match(sql, new RegExp(`CREATE TABLE IF NOT EXISTS ${table.replace(".", "\\.")}`, "i"))
  assert.match(sql, new RegExp(`ALTER TABLE ${table.replace(".", "\\.")} ENABLE ROW LEVEL SECURITY`, "i"))
}

assert.match(sql, /GRANT SELECT ON public\.jobs TO anon, authenticated;/i)
assert.match(sql, /GRANT INSERT, UPDATE, DELETE ON public\.jobs TO authenticated;/i)
assert.match(sql, /GRANT USAGE, SELECT ON SEQUENCE public\.jobs_id_seq TO authenticated;/i)
assert.match(sql, /CREATE POLICY "Public can read job ads"/i)
assert.match(sql, /CREATE POLICY "Employers can create own jobs"/i)
assert.match(sql, /WITH CHECK \(\(select auth\.uid\(\)\) = user_id\)/i)
assert.match(sql, /CREATE POLICY "Admins can read all payments"/i)
assert.match(sql, /CREATE OR REPLACE FUNCTION private\.is_jobwest_admin\(\)/i)
assert.match(sql, /USING \(private\.is_jobwest_admin\(\)\)/i)
assert.match(sql, /role text NOT NULL DEFAULT 'employer'/i)
assert.match(sql, /CREATE OR REPLACE FUNCTION public\.handle_new_user\(\)/i)
assert.match(sql, /CREATE TRIGGER on_auth_user_created/i)
assert.match(sql, /AFTER INSERT ON auth\.users/i)
assert.match(sql, /EXECUTE FUNCTION public\.handle_new_user\(\)/i)
assert.match(profileTriggerSql, /CREATE OR REPLACE FUNCTION public\.handle_new_user\(\)/i)
assert.match(profileTriggerSql, /CREATE TRIGGER on_auth_user_created/i)
assert.match(profileTriggerSql, /INSERT INTO public\.users \(id, email, name, image\)[\s\S]*FROM auth\.users/i)
assert.match(
  profileTriggerSql,
  /ALTER TABLE public\.users\s+ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now\(\);/i
)
assert.match(sql, /INSERT INTO storage\.buckets .*'avatars'/is)
assert.match(sql, /CREATE POLICY "Users can upload own avatars"/i)
assert.match(sql, /CREATE POLICY "Public can read avatars"/i)
