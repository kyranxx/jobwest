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

assert.match(productionPolicy, /img-src .*lh3\.googleusercontent\.com.*iuzmhwjdlywbhtgzuyib\.supabase\.co/)
assert.match(productionPolicy, /script-src .*https:\/\/www\.googletagmanager\.com.*https:\/\/www\.clarity\.ms.*https:\/\/connect\.facebook\.net.*https:\/\/snap\.licdn\.com/)
assert.match(productionPolicy, /connect-src .*https:\/\/iuzmhwjdlywbhtgzuyib\.supabase\.co.*wss:\/\/iuzmhwjdlywbhtgzuyib\.supabase\.co.*https:\/\/www\.google-analytics\.com.*https:\/\/stats\.g\.doubleclick\.net.*https:\/\/www\.clarity\.ms.*https:\/\/px\.ads\.linkedin\.com/)
assert.match(productionPolicy, /img-src .*https:\/\/www\.facebook\.com.*https:\/\/px\.ads\.linkedin\.com/)
assert.doesNotMatch(productionPolicy, /unsafe-eval/)

const developmentPolicy = buildContentSecurityPolicy({
  isDevelopment: true,
  supabaseUrl: "https://iuzmhwjdlywbhtgzuyib.supabase.co",
})

assert.match(developmentPolicy, /'unsafe-eval'/)
