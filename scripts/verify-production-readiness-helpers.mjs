function stripAnsi(value) {
  return value.replace(/\x1b\[[0-9;]*m/g, "")
}

export function cleanVercelCliOutput(value) {
  return stripAnsi(value)
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.trim() && !/^npm warn Unknown env config\b/i.test(line.trim()))
    .join("\n")
    .trim()
}

export function findMissingProductionEnv(vercelEnvOutput, requiredNames) {
  const productionNames = new Set()
  const required = new Set(requiredNames)

  for (const rawLine of stripAnsi(vercelEnvOutput).split(/\r?\n/)) {
    const columns = rawLine.trim().split(/\s{2,}/).filter(Boolean)
    const [name, , environments] = columns

    if (required.has(name) && /\bProduction\b/.test(environments ?? "")) {
      productionNames.add(name)
    }
  }

  return requiredNames.filter((name) => !productionNames.has(name))
}

export function parseVercelDomainStatus(vercelDomainOutput) {
  const text = stripAnsi(vercelDomainOutput)

  if (/not configured properly/i.test(text)) {
    const recommendedRecord = text.match(/`([^`]*\bA\s+[^`]+76\.76\.21\.21[^`]*)`/i)?.[1]

    return {
      configured: false,
      detail: recommendedRecord ?? "domain is not configured properly",
    }
  }

  return {
    configured: true,
    detail: "configured",
  }
}

export function isLiveStripeKeyForProductionSite(siteUrl, stripeSecretKey) {
  if (!siteUrl || !stripeSecretKey) return false

  const parsedSiteUrl = new URL(siteUrl)
  const isLocalHost = /^(localhost|127\.0\.0\.1)$/i.test(parsedSiteUrl.hostname)

  return isLocalHost || stripeSecretKey.startsWith("sk_live_")
}

export function shouldRequireProductionJobs(mode) {
  return mode !== "deploy"
}

export function shouldRequireLocalSecretValues(mode, includeVercelChecks) {
  return mode !== "deploy" || !includeVercelChecks
}

const jobPlaceholderValues = new Set([
  "aaa",
  "asdf",
  "bla bla",
  "blabla",
  "demo",
  "placeholder",
  "qwerty",
  "sample",
  "test",
  "testing",
  "todo",
  "xxx",
])

function normalizeText(value) {
  return (value ?? "").trim().replace(/\s+/g, " ").toLowerCase()
}

function isPlaceholderText(value) {
  const text = normalizeText(value)

  if (!text) return true
  if (jobPlaceholderValues.has(text)) return true

  return /^(test|demo|sample|todo|placeholder)\s*(job|ponuka|inzerat|inzerát|company|firma)?\s*\d*$/i.test(text)
}

export function isPublishableProductionJob(job) {
  if (isPlaceholderText(job.title) || isPlaceholderText(job.company) || isPlaceholderText(job.contact_info)) {
    return false
  }

  if (normalizeText(job.title).length < 3) return false
  if (normalizeText(job.company).length < 2) return false
  if (normalizeText(job.description).length < 40) return false
  if (normalizeText(job.description).includes("lorem ipsum")) return false
  if (!/(@|\+\d{3,}|http|www\.)/i.test(job.contact_info ?? "")) return false
  if (/\bexample\.(com|org|net|invalid)\b|\.example\b/i.test(job.contact_info ?? "")) return false
  if (/\+\d{1,3}(?:[\s()-]*0){6,}\b/.test(job.contact_info ?? "")) return false

  return true
}
