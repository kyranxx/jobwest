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
  const supabaseHttpsSource = supabaseHost ? `https://${supabaseHost}` : null
  const supabaseWssSource = supabaseHost ? `wss://${supabaseHost}` : null
  const imageSources = [
    "'self'",
    "blob:",
    "data:",
    "lh3.googleusercontent.com",
    supabaseHost,
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    "https://www.google.com",
    "https://www.google.sk",
    "https://www.googleadservices.com",
    "https://googleads.g.doubleclick.net",
    "https://stats.g.doubleclick.net",
    "https://td.doubleclick.net",
    "https://www.clarity.ms",
    "https://c.clarity.ms",
    "https://*.clarity.ms",
    "https://www.facebook.com",
    "https://px.ads.linkedin.com",
    "https://px4.ads.linkedin.com",
    "https://www.linkedin.com",
  ].filter(Boolean)
  const scriptSources = [
    "'self'",
    "https://accounts.google.com",
    "https://www.google.com",
    "https://www.gstatic.com",
    "https://www.googletagmanager.com",
    "https://www.clarity.ms",
    "https://connect.facebook.net",
    "https://snap.licdn.com",
    "'unsafe-inline'",
  ]
  const connectSources = [
    "'self'",
    supabaseHttpsSource,
    supabaseWssSource,
    "https://www.google-analytics.com",
    "https://analytics.google.com",
    "https://region1.google-analytics.com",
    "https://www.googleadservices.com",
    "https://googleads.g.doubleclick.net",
    "https://stats.g.doubleclick.net",
    "https://td.doubleclick.net",
    "https://www.clarity.ms",
    "https://*.clarity.ms",
    "https://www.google.com",
    "https://www.facebook.com",
    "https://px.ads.linkedin.com",
    "https://px4.ads.linkedin.com",
    "https://www.linkedin.com",
  ].filter(Boolean)

  if (isDevelopment) {
    scriptSources.push("'unsafe-eval'")
  }

  const styleSources = isDevelopment
    ? ["'self'", "https://accounts.google.com", "'unsafe-inline'"]
    : ["'self'", "'unsafe-inline'"]

  return `
    script-src ${scriptSources.join(" ")};
    style-src ${styleSources.join(" ")};
    connect-src ${connectSources.join(" ")};
    frame-src 'self' https://accounts.google.com https://www.google.com https://td.doubleclick.net;
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
