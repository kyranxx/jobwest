type MarketingEventParameters = Record<string, unknown>

declare global {
  interface Window {
    dataLayer?: unknown[]
    fbq?: (...args: unknown[]) => void
    gtag?: (...args: unknown[]) => void
  }
}

function cleanParameters(parameters: MarketingEventParameters) {
  return Object.fromEntries(Object.entries(parameters).filter(([, value]) => value !== undefined))
}

export function trackMarketingEvent(eventName: string, parameters: MarketingEventParameters = {}) {
  if (typeof window === "undefined") return

  const clean = cleanParameters(parameters)

  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ event: eventName, ...clean })
  window.gtag?.("event", eventName, clean)

  if (eventName === "page_view") {
    window.fbq?.("track", "PageView")
  } else {
    window.fbq?.("trackCustom", eventName, clean)
  }
}
