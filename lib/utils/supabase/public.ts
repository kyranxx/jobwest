import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { getSupabasePublicConfig } from "./env"

const PUBLIC_SUPABASE_FETCH_TIMEOUT_MS = 5000

export function getSupabasePublicClient() {
  const { url, anonKey } = getSupabasePublicConfig()

  return createClient<Database>(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      fetch: (input, init) => {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), PUBLIC_SUPABASE_FETCH_TIMEOUT_MS)

        return fetch(input, {
          ...init,
          signal: controller.signal,
          next: { revalidate: 300 },
        }).finally(() => clearTimeout(timeout))
      },
    },
  })
}
