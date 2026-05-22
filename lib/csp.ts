export function getSupabaseStorageHost(supabaseUrl: string | undefined) {
  if (!supabaseUrl) return null

  try {
    return new URL(supabaseUrl).hostname
  } catch {
    return null
  }
}

export function buildContentSecurityPolicy({
  isDevelopment,
  supabaseUrl,
}: {
  isDevelopment: boolean
  supabaseUrl: string | undefined
}) {
  const supabaseHost = getSupabaseStorageHost(supabaseUrl)
  const imageSources = ["'self'", "blob:", "data:", "lh3.googleusercontent.com", supabaseHost].filter(Boolean)
  const scriptSources = [
    "'self'",
    "https://accounts.google.com",
    "https://www.google.com",
    "https://www.gstatic.com",
    "'unsafe-inline'",
  ]

  if (isDevelopment) {
    scriptSources.push("'unsafe-eval'")
  }

  const styleSources = isDevelopment
    ? ["'self'", "https://accounts.google.com", "'unsafe-inline'"]
    : ["'self'", "'unsafe-inline'"]

  return `
    script-src ${scriptSources.join(" ")};
    style-src ${styleSources.join(" ")};
    frame-src 'self' https://accounts.google.com https://www.google.com;
    img-src ${imageSources.join(" ")};
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    block-all-mixed-content;
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, " ").trim()
}
