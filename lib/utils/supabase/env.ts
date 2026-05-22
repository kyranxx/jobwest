type SupabasePublicConfig = {
  url: string
  anonKey: string
}

const placeholderValues = new Set([
  "your_supabase_url",
  "your_supabase_anon_key",
  "your_supabase_service_role_key",
  "your_service_role_key_here",
])

function isProductionRuntime() {
  return process.env.VERCEL_ENV === "production"
}

function isPlaceholderValue(value: string | undefined) {
  const trimmedValue = value?.trim()

  if (!trimmedValue) return true
  if (placeholderValues.has(trimmedValue)) return true

  return /^https:\/\/example\.supabase\.co\/?$/i.test(trimmedValue) || /^ci-placeholder-/i.test(trimmedValue)
}

export function getSupabasePublicConfig(): SupabasePublicConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set")
  }

  if (!anonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not set")
  }

  if (isProductionRuntime() && isPlaceholderValue(url)) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured for production")
  }

  if (isProductionRuntime() && isPlaceholderValue(anonKey)) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured for production")
  }

  return { url, anonKey }
}

export function getSupabaseServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

  if (!key || isPlaceholderValue(key)) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set")
  }

  return key
}

