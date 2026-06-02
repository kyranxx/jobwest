import assert from "node:assert/strict"
import {
  cleanVercelCliOutput,
  findMissingProductionEnv,
  isPublishableProductionJob,
  isLiveStripeKeyForProductionSite,
  parseVercelDomainStatus,
  shouldRequireLocalSecretValues,
  shouldRequireProductionJobs,
} from "../scripts/verify-production-readiness-helpers.mjs"

const envListOutput = `
 name                               value               environments                        created
 NEXT_PUBLIC_APP_URL                Encrypted           Production                          3h ago
 NEXT_PUBLIC_SUPABASE_URL           Encrypted           Development, Preview, Production    317d ago
 STRIPE_SECRET_KEY                  Encrypted           Preview                             1d ago
`

assert.deepEqual(
  findMissingProductionEnv(envListOutput, [
    "NEXT_PUBLIC_APP_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "STRIPE_SECRET_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  ]),
  ["STRIPE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY"],
)

const configuredDomainOutput = `
  Nameservers

    Intended Nameservers    Current Nameservers
    ns1.vercel-dns.com      ns1.vercel-dns.com
    ns2.vercel-dns.com      ns2.vercel-dns.com
`

assert.deepEqual(parseVercelDomainStatus(configuredDomainOutput), {
  configured: true,
  detail: "configured",
})

const misconfiguredDomainOutput = `
WARN! This Domain is not configured properly. To configure it you should either:
  a) Set the following record on your DNS provider to continue: \`A jobwest.sk 76.76.21.21\` [recommended]
`

assert.deepEqual(parseVercelDomainStatus(misconfiguredDomainOutput), {
  configured: false,
  detail: "A jobwest.sk 76.76.21.21",
})

const noisyVercelFailure = `
npm warn Unknown env config "npm-globalconfig".
npm warn Unknown env config "verify-deps-before-run".
Vercel CLI 50.4.5
Retrieving project…
Error: Not able to create C:\\Users\\User\\AppData\\Roaming\\com.vercel.cli\\Data\\config.json (operation not permitted).
`

assert.equal(
  cleanVercelCliOutput(noisyVercelFailure),
  "Vercel CLI 50.4.5\nRetrieving project…\nError: Not able to create C:\\Users\\User\\AppData\\Roaming\\com.vercel.cli\\Data\\config.json (operation not permitted).",
)

assert.equal(isLiveStripeKeyForProductionSite("https://jobwest.sk", "sk_live_real"), true)
assert.equal(isLiveStripeKeyForProductionSite("https://jobwest.sk", "sk_test_real"), false)
assert.equal(isLiveStripeKeyForProductionSite("http://localhost:3000", "sk_test_real"), true)
assert.equal(isLiveStripeKeyForProductionSite("https://127.0.0.1:3000", "sk_test_real"), true)

assert.equal(shouldRequireProductionJobs("deploy"), false)
assert.equal(shouldRequireProductionJobs("go-live"), true)
assert.equal(shouldRequireProductionJobs(undefined), true)

assert.equal(shouldRequireLocalSecretValues("deploy", true), false)
assert.equal(shouldRequireLocalSecretValues("deploy", false), true)
assert.equal(shouldRequireLocalSecretValues("go-live", true), true)

const validProductionJob = {
  title: "Skladnik v Nemecku",
  company: "Real Agency s.r.o.",
  description: "Overena pracovna ponuka s jasnou mzdou, nastupom, ubytovanim a kontaktom pre uchadzacov.",
  contact_info: "jobs@real-agency.sk",
}

assert.equal(isPublishableProductionJob(validProductionJob), true)
assert.equal(isPublishableProductionJob({ ...validProductionJob, contact_info: "jobs@westwerk.example" }), false)
assert.equal(isPublishableProductionJob({ ...validProductionJob, contact_info: "jobs@example.com" }), false)
assert.equal(isPublishableProductionJob({ ...validProductionJob, contact_info: "+43 000 000 000" }), false)
