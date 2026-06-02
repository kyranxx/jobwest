"use client"

import Script from "next/script"
import { usePathname } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  hasAnalyticsIntegrations,
  hasMarketingIntegrations,
  type PublicMarketingIntegrations,
} from "@/lib/marketing-integrations"
import { trackMarketingEvent } from "@/lib/marketing-events"

type ConsentState = {
  analytics: boolean
  marketing: boolean
}

type StoredConsent = ConsentState & {
  decidedAt: string
}

const consentStorageKey = "jobwest:marketing-consent:v1"

export function MarketingConsent({ config }: { config: PublicMarketingIntegrations }) {
  const hasAnalytics = hasAnalyticsIntegrations(config)
  const hasMarketing = hasMarketingIntegrations(config)
  const hasConfigurableScripts = hasAnalytics || hasMarketing
  const [consent, setConsent] = useState<ConsentState | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [draft, setDraft] = useState<ConsentState>({ analytics: false, marketing: false })

  useEffect(() => {
    if (!hasConfigurableScripts) return

    try {
      const stored = window.localStorage.getItem(consentStorageKey)
      if (!stored) {
        setIsOpen(true)
        return
      }

      const parsed = JSON.parse(stored) as Partial<StoredConsent>
      const nextConsent = {
        analytics: Boolean(parsed.analytics),
        marketing: Boolean(parsed.marketing),
      }

      setConsent(nextConsent)
      setDraft(nextConsent)
    } catch {
      window.localStorage.removeItem(consentStorageKey)
      setIsOpen(true)
    }
  }, [hasConfigurableScripts])

  function saveConsent(nextConsent: ConsentState) {
    const storedConsent: StoredConsent = {
      ...nextConsent,
      decidedAt: new Date().toISOString(),
    }

    window.localStorage.setItem(consentStorageKey, JSON.stringify(storedConsent))
    setConsent(nextConsent)
    setDraft(nextConsent)
    setIsOpen(false)
  }

  if (!hasConfigurableScripts) return null

  const analyticsAllowed = Boolean(consent?.analytics && hasAnalytics)
  const marketingAllowed = Boolean(consent?.marketing && hasMarketing)

  return (
    <>
      <MarketingScripts config={config} analyticsAllowed={analyticsAllowed} marketingAllowed={marketingAllowed} />
      <RouteTracker analyticsAllowed={analyticsAllowed} marketingAllowed={marketingAllowed} />

      {isOpen && (
        <div
          role="dialog"
          aria-label="Nastavenia cookies"
          className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.18)]"
        >
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <div>
              <h2 className="text-sm font-semibold text-slate-950">Cookies a meranie návštevnosti</h2>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                Nevyhnutné cookies používame vždy. Analytiku a marketingové meranie zapneme iba po súhlase.
              </p>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-700">
                {hasAnalytics && (
                  <label className="inline-flex items-center gap-2">
                    <input
                      id="cookie-consent-analytics"
                      type="checkbox"
                      checked={draft.analytics}
                      onChange={(event) => setDraft((current) => ({ ...current, analytics: event.target.checked }))}
                      className="size-4 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    Analytika
                  </label>
                )}
                {hasMarketing && (
                  <label className="inline-flex items-center gap-2">
                    <input
                      id="cookie-consent-marketing"
                      type="checkbox"
                      checked={draft.marketing}
                      onChange={(event) => setDraft((current) => ({ ...current, marketing: event.target.checked }))}
                      className="size-4 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    Marketing
                  </label>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 md:justify-end">
              <Button type="button" variant="ghost" size="sm" onClick={() => saveConsent({ analytics: false, marketing: false })}>
                Iba nevyhnutné
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => saveConsent(draft)}>
                Uložiť výber
              </Button>
              <Button type="button" size="sm" onClick={() => saveConsent({ analytics: hasAnalytics, marketing: hasMarketing })}>
                Povoliť všetko
              </Button>
            </div>
          </div>
        </div>
      )}

      {!isOpen && consent && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-3 left-3 z-[60] rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:text-slate-950"
        >
          Cookies
        </button>
      )}
    </>
  )
}

function MarketingScripts({
  config,
  analyticsAllowed,
  marketingAllowed,
}: {
  config: PublicMarketingIntegrations
  analyticsAllowed: boolean
  marketingAllowed: boolean
}) {
  const shouldLoadTagManager = Boolean(config.tagManagerId && (analyticsAllowed || marketingAllowed))
  const shouldLoadDirectGtag = Boolean(!config.tagManagerId && ((config.gaMeasurementId && analyticsAllowed) || (config.googleAdsId && marketingAllowed)))
  const firstGtagId = config.gaMeasurementId && analyticsAllowed ? config.gaMeasurementId : config.googleAdsId

  return (
    <>
      {shouldLoadTagManager && config.tagManagerId && (
        <Script id="jobwest-gtm" strategy="afterInteractive">
          {buildTagManagerScript(config.tagManagerId, analyticsAllowed, marketingAllowed)}
        </Script>
      )}

      {shouldLoadDirectGtag && firstGtagId && (
        <Script
          id="jobwest-gtag-src"
          src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(firstGtagId)}`}
          strategy="afterInteractive"
        />
      )}
      {shouldLoadDirectGtag && (
        <Script id="jobwest-gtag" strategy="afterInteractive">
          {buildGtagScript(config, analyticsAllowed, marketingAllowed)}
        </Script>
      )}

      {analyticsAllowed && config.clarityProjectId && (
        <Script id="jobwest-clarity" strategy="afterInteractive">
          {buildClarityScript(config.clarityProjectId)}
        </Script>
      )}

      {marketingAllowed && config.metaPixelId && (
        <Script id="jobwest-meta-pixel" strategy="afterInteractive">
          {buildMetaPixelScript(config.metaPixelId)}
        </Script>
      )}

      {marketingAllowed && config.linkedInPartnerId && (
        <Script id="jobwest-linkedin-insight" strategy="afterInteractive">
          {buildLinkedInScript(config.linkedInPartnerId)}
        </Script>
      )}
    </>
  )
}

function RouteTracker({
  analyticsAllowed,
  marketingAllowed,
}: {
  analyticsAllowed: boolean
  marketingAllowed: boolean
}) {
  const pathname = usePathname()
  const canTrack = analyticsAllowed || marketingAllowed
  const trackingKey = useMemo(() => {
    if (!canTrack || typeof window === "undefined") return pathname

    return `${pathname}${window.location.search}`
  }, [canTrack, pathname])

  useEffect(() => {
    if (!canTrack) return

    trackMarketingEvent("page_view", {
      page_path: trackingKey,
      page_title: document.title,
    })
  }, [canTrack, trackingKey])

  return null
}

function buildTagManagerScript(tagManagerId: string, analyticsAllowed: boolean, marketingAllowed: boolean) {
  return `
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(${JSON.stringify(buildConsentPayload(analyticsAllowed, marketingAllowed))});
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',${JSON.stringify(tagManagerId)});
  `
}

function buildGtagScript(config: PublicMarketingIntegrations, analyticsAllowed: boolean, marketingAllowed: boolean) {
  const gaConfig = config.gaMeasurementId && analyticsAllowed
    ? `gtag('config', ${JSON.stringify(config.gaMeasurementId)}, { anonymize_ip: true, send_page_view: false });`
    : ""
  const adsConfig = config.googleAdsId && marketingAllowed
    ? `gtag('config', ${JSON.stringify(config.googleAdsId)}, { send_page_view: false });`
    : ""

  return `
    window.dataLayer = window.dataLayer || [];
    function gtag(){window.dataLayer.push(arguments);}
    gtag('consent', 'default', ${JSON.stringify(buildConsentMode(analyticsAllowed, marketingAllowed))});
    gtag('js', new Date());
    ${gaConfig}
    ${adsConfig}
  `
}

function buildClarityScript(projectId: string) {
  return `
    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", ${JSON.stringify(projectId)});
  `
}

function buildMetaPixelScript(pixelId: string) {
  return `
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
    (window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', ${JSON.stringify(pixelId)});
  `
}

function buildLinkedInScript(partnerId: string) {
  return `
    window._linkedin_partner_id = ${JSON.stringify(partnerId)};
    window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
    window._linkedin_data_partner_ids.push(window._linkedin_partner_id);
    (function(l) {
      if (!l){
        window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
        window.lintrk.q=[];
      }
      var s = document.getElementsByTagName("script")[0];
      var b = document.createElement("script");
      b.type = "text/javascript";b.async = true;
      b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
      s.parentNode.insertBefore(b, s);
    })(window.lintrk);
  `
}

function buildConsentPayload(analyticsAllowed: boolean, marketingAllowed: boolean) {
  return {
    event: "jobwest_consent_update",
    ...buildConsentMode(analyticsAllowed, marketingAllowed),
  }
}

function buildConsentMode(analyticsAllowed: boolean, marketingAllowed: boolean) {
  return {
    analytics_storage: analyticsAllowed ? "granted" : "denied",
    ad_storage: marketingAllowed ? "granted" : "denied",
    ad_user_data: marketingAllowed ? "granted" : "denied",
    ad_personalization: marketingAllowed ? "granted" : "denied",
  }
}
