import assert from "node:assert/strict"
import { getSupabasePublicConfig, getSupabaseServiceRoleKey } from "@/lib/utils/supabase/env"

const originalEnv = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  VERCEL_ENV: process.env.VERCEL_ENV,
}

function restoreEnv() {
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = value
    }
  }
}

try {
  process.env.VERCEL_ENV = "production"
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co"
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "ci-placeholder-anon-key"

  assert.throws(
    () => getSupabasePublicConfig(),
    /NEXT_PUBLIC_SUPABASE_URL is not configured for production/,
  )

  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://abc.supabase.co"
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "your_supabase_anon_key"

  assert.throws(
    () => getSupabasePublicConfig(),
    /NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured for production/,
  )

  process.env.VERCEL_ENV = "preview"
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co"
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "ci-placeholder-anon-key"

  assert.deepEqual(getSupabasePublicConfig(), {
    url: "https://example.supabase.co",
    anonKey: "ci-placeholder-anon-key",
  })

  process.env.SUPABASE_SERVICE_ROLE_KEY = "your_supabase_service_role_key"

  assert.throws(
    () => getSupabaseServiceRoleKey(),
    /SUPABASE_SERVICE_ROLE_KEY is not set/,
  )
} finally {
  restoreEnv()
}
