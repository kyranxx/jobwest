import assert from "node:assert/strict"
import { buildContentSecurityPolicy, getSupabaseStorageHost } from "@/lib/csp"

assert.equal(
  getSupabaseStorageHost("https://iuzmhwjdlywbhtgzuyib.supabase.co"),
  "iuzmhwjdlywbhtgzuyib.supabase.co",
)

assert.equal(getSupabaseStorageHost("not-a-url"), null)

const productionPolicy = buildContentSecurityPolicy({
  isDevelopment: false,
  supabaseUrl: "https://iuzmhwjdlywbhtgzuyib.supabase.co",
})

assert.match(productionPolicy, /img-src 'self' blob: data: lh3\.googleusercontent\.com iuzmhwjdlywbhtgzuyib\.supabase\.co;/)
assert.doesNotMatch(productionPolicy, /unsafe-eval/)

const developmentPolicy = buildContentSecurityPolicy({
  isDevelopment: true,
  supabaseUrl: "https://iuzmhwjdlywbhtgzuyib.supabase.co",
})

assert.match(developmentPolicy, /'unsafe-eval'/)
