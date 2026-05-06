import { createClient } from "@supabase/supabase-js"
import { getSupabasePublicConfig, getSupabaseServiceRoleKey } from "./env"
import type { Database } from "@/lib/database.types"

export function getSupabaseServiceClient() {
  const { url } = getSupabasePublicConfig()
  const key = getSupabaseServiceRoleKey()

  return createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
