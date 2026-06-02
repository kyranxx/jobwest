import type React from "react";
import type { Metadata, Viewport } from "next";
import "@/app/globals.css";
import "./flags.css";
import { Toaster } from "@/components/ui/sonner"
import Link from "next/link"
import Image from "next/image";
import { HeaderActions } from "@/components/auth/header-actions"
import { AuthProvider } from "@/hooks/use-auth"
import { MarketingConsent } from "@/components/marketing/marketing-consent"
import { countries, getCountryPath } from "@/lib/countries"
import { getPublicMarketingIntegrations, getSiteVerificationMetadata } from "@/lib/marketing-integrations"
import { siteConfig } from "@/lib/site"

const copyrightYear = new Date().getFullYear()
const footerCountryCodes = new Set(["de", "at", "ch", "nl", "ie", "gb", "fr", "it", "dk", "se", "cz"])
const footerCountries = countries.filter((country) => footerCountryCodes.has(country.code))
const siteUrl = siteConfig.url
const marketingIntegrations = getPublicMarketingIntegrations()
const siteVerification = getSiteVerificationMetadata()

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "JobWest - práca v zahraničí",
    template: "%s | JobWest",
  },
  description: "Prehliadajte pracovné ponuky v zahraničí. Práca v Nemecku, Rakúsku, Švajčiarsku, Holandsku a ďalších krajinách západnej Európy.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "JobWest - práca v zahraničí",
    description: "Pracovné ponuky v zahraničí s jasnou mzdou, lokalitou, typom spolupráce a informáciou o ubytovaní.",
    url: "/",
    siteName: siteConfig.name,
    locale: "sk_SK",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  ...(siteVerification ? { verification: siteVerification } : {}),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/jobwest-favicon.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
}

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#7A1955",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="sk" suppressHydrationWarning>
      <head />
      <body className="min-h-screen bg-background">
        <a
          href="#main-content"
          className="sr-only fixed left-3 top-3 z-[100] rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-950 shadow-md focus:not-sr-only"
        >
          Preskočiť na hlavný obsah
        </a>
        <AuthProvider>
          <div className="relative flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 w-full border-b border-[#e4dfd8] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/86">
              <div className="mx-auto flex h-16 w-full max-w-screen-2xl items-center justify-between gap-4 px-3 md:px-6">
                <Link href="/" prefetch={false} className="flex min-w-0 shrink items-center gap-2">
                  <Image
                    src="/logo.png"
                    alt="Práca v zahraničí"
                    width={167}
                    height={40}
                    className="h-8 w-auto md:h-10"
                    style={{ width: "auto" }}
                    priority
                  />
                </Link>
                <nav className="hidden items-center gap-10 text-sm font-semibold text-[#241033] md:flex">
                  <Link href="/ponuky" prefetch={false} className="transition hover:text-primary">
                    Ponuky
                  </Link>
                  <Link href="/krajiny" prefetch={false} className="transition hover:text-primary">
                    Krajiny
                  </Link>
                  <Link href="/ucet/pridat-inzerat" prefetch={false} className="transition hover:text-primary">
                    Pre firmy
                  </Link>
                </nav>
                <nav className="flex shrink-0 items-center gap-1">
                  <HeaderActions />
                </nav>
              </div>
            </header>

            <div id="main-content" tabIndex={-1} className="flex-1">{children}</div>

            <footer className="border-t border-emerald-900/30 bg-[#070b16] text-slate-200">
                <div className="mx-auto max-w-6xl px-4 py-14 text-center md:px-6 md:py-20">
                  <Link href="/" prefetch={false} className="inline-flex items-center text-3xl font-bold tracking-tight text-white">
                    {siteConfig.name}
                  </Link>
                  <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                    Inzertný portál pre prácu v zahraničí. Prehľadné ponuky, jasné podmienky a jednoduché pridávanie inzerátov pre firmy a agentúry.
                  </p>

                  <div className="mx-auto mt-9 grid max-w-4xl gap-8 sm:grid-cols-3">
                    <div>
                      <h2 className="text-sm font-semibold text-white">Pre uchádzačov</h2>
                      <ul className="mt-4 space-y-2.5">
                        <li><Link href="/ponuky" prefetch={false} className="text-sm text-slate-400 transition-colors hover:text-white">Hľadať prácu</Link></li>
                        <li><Link href="/ponuky" prefetch={false} className="text-sm text-slate-400 transition-colors hover:text-white">Kategórie</Link></li>
                        <li><Link href="/krajiny" prefetch={false} className="text-sm text-slate-400 transition-colors hover:text-white">Krajiny</Link></li>
                      </ul>
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-white">Pre zamestnávateľov</h2>
                      <ul className="mt-4 space-y-2.5">
                        <li className="text-sm text-slate-400">Pridanie inzerátu zdarma</li>
                        <li className="text-sm text-slate-400">Správa ponúk v účte</li>
                        <li className="text-sm text-slate-400">Platené TOP a Exclusive zvýraznenie</li>
                      </ul>
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-white">Kontakt</h2>
                      <ul className="mt-4 space-y-2.5">
                        <li className="text-sm text-slate-400">{siteConfig.contactEmail}</li>
                        <li className="text-sm text-slate-400">Slovensko</li>
                        <li className="text-sm text-slate-400">Inzercia pracovných ponúk</li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-10 flex items-center justify-center gap-4">
                    <Image src="/visa.svg" alt="Visa" width={48} height={30} className="h-[28px] w-[45px] object-contain opacity-80" />
                    <Image src="/mastercard.svg" alt="Mastercard" width={38} height={30} className="h-[28px] w-[36px] object-contain opacity-80" />
                    <Image src="/stripe.svg" alt="Stripe" width={58} height={26} className="h-[24px] w-[54px] object-contain opacity-80" />
                  </div>

                  <div className="mx-auto mt-9 max-w-4xl">
                    <h2 className="text-sm font-semibold text-white">Krajiny</h2>
                    <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
                      {footerCountries.map((country) => (
                        <Link
                          key={country.code}
                          href={getCountryPath(country.code)}
                          prefetch={false}
                          className="text-sm text-slate-400 transition-colors hover:text-white"
                        >
                          {country.name}
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="mx-auto mt-10 flex max-w-4xl flex-col items-center justify-center gap-4 border-t border-white/10 pt-7 sm:flex-row">
                    <p className="text-xs text-slate-400">
                      &copy; {copyrightYear} JobWest. Všetky práva vyhradené.
                    </p>
                    <div className="flex items-center gap-4">
                      <Link href="/obchodne-podmienky" prefetch={false} className="text-xs text-slate-400 transition-colors hover:text-slate-200">Obchodné podmienky</Link>
                      <Link href="/ochrana-sukromia" prefetch={false} className="text-xs text-slate-400 transition-colors hover:text-slate-200">Ochrana súkromia</Link>
                    </div>
                  </div>
                </div>
            </footer>
          </div>
        </AuthProvider>
        <MarketingConsent config={marketingIntegrations} />
        <Toaster />
      </body>
    </html>
  )
}
