import dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"
import Stripe from "stripe"
import { existsSync, readFileSync } from "node:fs"
import { lookup } from "node:dns/promises"
import { spawnSync } from "node:child_process"
import {
  cleanVercelCliOutput,
  findMissingProductionEnv,
  isPublishableProductionJob,
  isLiveStripeKeyForProductionSite,
  parseVercelDomainStatus,
  shouldRequireLocalSecretValues,
  shouldRequireProductionJobs,
} from "./verify-production-readiness-helpers.mjs"

const args = process.argv.slice(2)
const mode = getArgValue("--mode") ?? "go-live"
const envFile = args.find((arg) => !arg.startsWith("--")) ?? (existsSync(".env.production.local") ? ".env.production.local" : ".env.local")
const includeDnsChecks = mode !== "deploy"
const includeVercelChecks = !args.includes("--skip-vercel") && existsSync(".vercel/project.json")
const portalRegistry = JSON.parse(readFileSync(new URL("../lib/portal-registry.json", import.meta.url), "utf8"))

dotenv.config({ path: envFile, quiet: true })
dotenv.config({ quiet: true })

const placeholderValues = new Set([
  "your_supabase_url",
  "your_supabase_anon_key",
  "your_supabase_service_role_key",
  "your_service_role_key_here",
  "sk_test_your_key",
  "sk_test_your_key_here",
  "sk_live_your_key",
  "sk_live_your_key_here",
  "whsec_your_webhook_secret",
  "whsec_your_webhook_secret_here",
  "your_turnstile_site_key",
  "your_turnstile_secret_key",
])

const requiredEnv = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_PORTAL_CODE",
  "NEXT_PUBLIC_PORTAL_DOMAIN",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
  "TURNSTILE_SECRET_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
]
const serverSecretEnv = new Set([
  "SUPABASE_SERVICE_ROLE_KEY",
  "TURNSTILE_SECRET_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
])

const checks = []

function record(name, ok, detail = "") {
  checks.push({ name, ok, detail })
}

function envValue(name) {
  return process.env[name]?.trim()
}

function hasConfiguredEnv(name) {
  const value = envValue(name)
  return Boolean(value && !placeholderValues.has(value))
}

function getArgValue(name) {
  const prefix = `${name}=`
  const match = args.find((arg) => arg.startsWith(prefix))
  return match?.slice(prefix.length)
}

function failOnSupabaseError(label, error) {
  if (!error) {
    record(label, true)
    return
  }

  record(label, false, error.message)
}

function formatError(error) {
  if (!(error instanceof Error)) return String(error)

  const cause = error.cause
  if (cause && typeof cause === "object" && "code" in cause) {
    const code = cause.code
    const hostname = "hostname" in cause ? ` ${cause.hostname}` : ""
    return `${error.message} (${code}${hostname})`
  }

  return error.message
}

function runVercel(args) {
  if (!args.every((arg) => /^[a-z0-9._:@=/-]+$/i.test(arg))) {
    return { ok: false, output: "unsafe vercel argument" }
  }

  const command = process.platform === "win32" ? process.env.ComSpec ?? "cmd.exe" : "npx"
  const commandArgs =
    process.platform === "win32"
      ? ["/d", "/s", "/c", ["npx", "vercel", ...args].join(" ")]
      : ["vercel", ...args]
  const result = spawnSync(command, commandArgs, {
    encoding: "utf8",
    shell: false,
  })

  return {
    ok: result.status === 0,
    output: cleanVercelCliOutput(`${result.stdout ?? ""}${result.stderr ?? ""}${result.error?.message ?? ""}`),
  }
}

const requireLocalSecretValues = shouldRequireLocalSecretValues(mode, includeVercelChecks)

for (const name of requiredEnv.filter((name) => requireLocalSecretValues || !serverSecretEnv.has(name))) {
  record(`${name} is configured`, hasConfiguredEnv(name), hasConfiguredEnv(name) ? "" : "missing or placeholder")
}

const siteUrl = envValue("NEXT_PUBLIC_SITE_URL")
const appUrl = envValue("NEXT_PUBLIC_APP_URL")
const portalDomain = envValue("NEXT_PUBLIC_PORTAL_DOMAIN")
const portalCode = envValue("NEXT_PUBLIC_PORTAL_CODE")
const portalConfig = portalRegistry.find((portal) => portal.code === portalCode)
const stripeSecretKey = envValue("STRIPE_SECRET_KEY")
const stripeWebhookPath = "/api/stripe/webhook"
const supabaseUrl = envValue("NEXT_PUBLIC_SUPABASE_URL")?.replace(/\/$/, "")
const supabaseAnonKey = envValue("NEXT_PUBLIC_SUPABASE_ANON_KEY")
let parsedSiteUrl = null
let parsedAppUrl = null

try {
  if (siteUrl) {
    parsedSiteUrl = new URL(siteUrl)
    record("NEXT_PUBLIC_SITE_URL uses https outside localhost", parsedSiteUrl.protocol === "https:" || parsedSiteUrl.hostname === "localhost" || parsedSiteUrl.hostname === "127.0.0.1", siteUrl)
  }
} catch {
  record("NEXT_PUBLIC_SITE_URL is a valid URL", false, siteUrl ?? "missing")
}

try {
  if (appUrl) {
    parsedAppUrl = new URL(appUrl)
    record("NEXT_PUBLIC_APP_URL is a valid URL", Boolean(parsedAppUrl.hostname), appUrl)
  }
} catch {
  record("NEXT_PUBLIC_APP_URL is a valid URL", false, appUrl ?? "missing")
}

if (siteUrl && portalDomain) {
  if (parsedSiteUrl) {
    const hostname = parsedSiteUrl.hostname.replace(/^www\./, "")
    record("Portal domain matches site URL", hostname === portalDomain.replace(/^www\./, ""), `${hostname} vs ${portalDomain}`)
  } else {
    record("Portal domain matches site URL", false, "site URL could not be parsed")
  }
}

if (portalCode) {
  record(
    "Portal code is registered for JobWest CEE rollout",
    Boolean(portalConfig),
    portalConfig ? portalConfig.name : `unknown portal code ${portalCode}`,
  )
}

if (portalCode && portalDomain && portalConfig) {
  record(
    "Portal domain matches registered portal code",
    portalDomain.replace(/^www\./, "") === portalConfig.domain,
    `${portalCode} => ${portalConfig.domain}, env ${portalDomain}`,
  )
}

if (includeDnsChecks && portalDomain && !/^(localhost|127\.0\.0\.1)$/i.test(portalDomain)) {
  try {
    const addresses = (await lookup(portalDomain, { all: true, family: 4 })).map((entry) => entry.address)
    record("Portal domain A record points to Vercel", addresses.includes("76.76.21.21"), addresses.join(", "))
  } catch (error) {
    record("Portal domain A record points to Vercel", false, formatError(error))
  }
}

if (includeVercelChecks) {
  const envResult = runVercel(["env", "ls"])

  if (envResult.ok) {
    const missingProductionEnv = findMissingProductionEnv(envResult.output, requiredEnv)
    record(
      "Vercel Production has required env names",
      missingProductionEnv.length === 0,
      missingProductionEnv.length > 0 ? `missing ${missingProductionEnv.join(", ")}` : "all required names present",
    )
  } else {
    record("Vercel Production has required env names", false, envResult.output || "vercel env ls failed")
  }

  if (portalDomain && includeDnsChecks && !/^(localhost|127\.0\.0\.1)$/i.test(portalDomain)) {
    const domainResult = runVercel(["domains", "inspect", portalDomain])

    if (domainResult.ok) {
      const domainStatus = parseVercelDomainStatus(domainResult.output)
      record("Vercel domain is configured", domainStatus.configured, domainStatus.detail)
    } else {
      record("Vercel domain is configured", false, domainResult.output || "vercel domains inspect failed")
    }
  }
}

if (parsedSiteUrl && stripeSecretKey) {
  record(
    "Production site uses a live Stripe secret key",
    isLiveStripeKeyForProductionSite(siteUrl, stripeSecretKey),
    /^(localhost|127\.0\.0\.1)$/i.test(parsedSiteUrl.hostname) ? "local site" : "expected sk_live_ for production domain",
  )
}

async function checkSupabaseRest(path, label) {
  if (!supabaseUrl || !supabaseAnonKey) return

  try {
    const response = await fetch(`${supabaseUrl}${path}`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        Accept: "application/json",
      },
    })
    const text = await response.text()

    if (response.ok) {
      record(label, true)
      return
    }

    let detail = text
    try {
      const json = JSON.parse(text)
      detail = json.message || json.code || text
    } catch {}

    record(label, false, `${response.status} ${detail}`)
  } catch (error) {
    record(label, false, formatError(error))
  }
}

async function checkProductionJobs() {
  if (!supabaseUrl || !supabaseAnonKey) return

  const currentPortalCode = portalCode ?? "sk"
  const path = `/rest/v1/jobs?select=id,title,company,description,contact_info,portal_code&portal_code=eq.${encodeURIComponent(currentPortalCode)}&limit=20`

  try {
    const response = await fetch(`${supabaseUrl}${path}`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        Accept: "application/json",
      },
    })
    const text = await response.text()

    if (!response.ok) {
      record("Production portal has at least one real job ad with contact info", false, `${response.status} ${text}`)
      return
    }

    const jobs = JSON.parse(text)
    const publishableCount = Array.isArray(jobs) ? jobs.filter(isPublishableProductionJob).length : 0
    record(
      "Production portal has at least one real job ad with contact info",
      publishableCount > 0,
      publishableCount > 0 ? `${publishableCount} publishable job(s)` : `no publishable jobs for portal ${currentPortalCode}`,
    )
  } catch (error) {
    record("Production portal has at least one real job ad with contact info", false, formatError(error))
  }
}

if (hasConfiguredEnv("NEXT_PUBLIC_SUPABASE_URL") && hasConfiguredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")) {
  await checkSupabaseRest("/rest/v1/jobs?select=id,portal_code,portal_domain,highlight_tier,is_top,topped_at,contact_info&limit=1", "Supabase REST API and public jobs schema are reachable")
  if (shouldRequireProductionJobs(mode)) {
    await checkProductionJobs()
  }
}

if (hasConfiguredEnv("NEXT_PUBLIC_SUPABASE_URL") && hasConfiguredEnv("SUPABASE_SERVICE_ROLE_KEY")) {
  const supabase = createClient(supabaseUrl, envValue("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const jobsCheck = await supabase
    .from("jobs")
    .select("id, portal_code, portal_domain, highlight_tier, is_top, topped_at, contact_info")
    .limit(1)

  failOnSupabaseError("Supabase jobs table has portal/highlight/contact columns", jobsCheck.error)

  const paymentsCheck = await supabase
    .from("payments")
    .select("id, user_id, job_id, portal_code, tier, amount_cents, currency, status, stripe_session_id")
    .limit(1)

  failOnSupabaseError("Supabase payments table has admin metric columns", paymentsCheck.error)

  const usersCheck = await supabase
    .from("users")
    .select("id, role")
    .limit(1)

  failOnSupabaseError("Supabase users table exposes admin role column", usersCheck.error)

  const avatarsBucketCheck = await supabase.storage.getBucket("avatars")

  failOnSupabaseError("Supabase avatars storage bucket exists", avatarsBucketCheck.error)
}

if (hasConfiguredEnv("STRIPE_SECRET_KEY")) {
  try {
    const stripe = new Stripe(stripeSecretKey)
    await stripe.balance.retrieve()
    record("Stripe secret key can reach Stripe API", true)

    if (parsedAppUrl) {
      const webhookUrl = new URL(stripeWebhookPath, parsedAppUrl).toString()
      const endpoints = await stripe.webhookEndpoints.list({ limit: 100 })
      const matchingEndpoint = endpoints.data.find((endpoint) => endpoint.url === webhookUrl)
      const listensForCheckout =
        matchingEndpoint?.enabled_events.includes("*") ||
        matchingEndpoint?.enabled_events.includes("checkout.session.completed")

      record(
        "Stripe webhook endpoint is enabled for checkout.session.completed",
        matchingEndpoint?.status === "enabled" && listensForCheckout,
        webhookUrl,
      )
    }
  } catch (error) {
    record("Stripe secret key can reach Stripe API", false, formatError(error))
  }
}

const failed = checks.filter((check) => !check.ok)

for (const check of checks) {
  const status = check.ok ? "PASS" : "FAIL"
  console.log(`${status} ${check.name}${check.detail ? ` :: ${check.detail}` : ""}`)
}

console.log(`SUMMARY ${checks.length - failed.length}/${checks.length} passed`)

if (failed.length > 0) {
  process.exit(1)
}
