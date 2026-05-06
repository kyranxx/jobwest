import type React from "react";
import "@/app/globals.css";
import "./flags.css";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"
import Link from "next/link"
import Image from "next/image";
import { AddAdButton } from "@/components/auth/add-ad-button"
import { UserButton } from "@/components/auth/user-button"
import { AuthProvider } from "@/hooks/use-auth"

const inter = Inter({ subsets: ["latin", "latin-ext"] })

export const metadata = {
  title: "Práca v zahraničí - Nájdite si prácu v zahraničí",
  description: "Prehliadajte pracovné ponuky v zahraničí. Práca v Nemecku, Rakúsku, Švajčiarsku a ďalších krajinách.",
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="sk" suppressHydrationWarning>
      <head />
      <body className={`${inter.className} min-h-screen bg-background`}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <div className="relative flex min-h-screen flex-col">
              <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                <div className="max-w-screen-2xl mx-auto flex h-14 md:h-16 items-center justify-between px-3 md:px-6">
                  <Link href="/" className="flex items-center gap-2 shrink-0">
                    <Image
                      src="/logo.png"
                      alt="Práca v zahraničí"
                      width={140}
                      height={40}
                      className="h-9 w-auto md:h-10"
                      priority
                    />
                  </Link>
                  <nav className="flex items-center gap-1">
                    <AddAdButton />
                    <div className="h-5 w-px bg-border mx-0.5 hidden sm:block" />
                    <UserButton />
                  </nav>
                </div>
              </header>

              <main className="flex-1">{children}</main>

              <footer className="border-t bg-slate-900 text-slate-200">
                <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-10 md:py-14">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
                    <div className="lg:col-span-1">
                      <Link href="/" className="inline-block mb-4">
                        <Image
                          src="/logo.png"
                          alt="Práca v zahraničí"
                          width={140}
                          height={40}
                          className="h-9 w-auto brightness-0 invert"
                        />
                      </Link>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        Portál pracovných ponúk zameraný na prácu v zahraničí. Spájame ľudí s pracovnými príležitosťami v krajinách západnej Európy.
                      </p>
                      <div className="flex items-center gap-3 mt-4">
                        <Image src="/visa.svg" alt="Visa" width={40} height={25} className="h-6 w-auto opacity-70" />
                        <Image src="/mastercard.svg" alt="Mastercard" width={32} height={25} className="h-6 w-auto opacity-70" />
                        <Image src="/stripe.svg" alt="Stripe" width={50} height={22} className="h-5 w-auto opacity-70" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-4 text-slate-100">Pre uchádzačov</h4>
                      <ul className="space-y-2.5">
                        <li><Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors">Hľadať prácu</Link></li>
                        <li><Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors">Kategórie</Link></li>
                        <li><Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors">Krajiny</Link></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-4 text-slate-100">Pre zamestnávateľov</h4>
                      <ul className="space-y-2.5">
                        <li><Link href="/ucet/pridat-inzerat" className="text-sm text-slate-400 hover:text-white transition-colors">Pridať inzerát</Link></li>
                        <li><Link href="/ucet" className="text-sm text-slate-400 hover:text-white transition-colors">Môj účet</Link></li>
                        <li><Link href="/platba" className="text-sm text-slate-400 hover:text-white transition-colors">Zvýraznenie inzerátu</Link></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-4 text-slate-100">Kontakt</h4>
                      <ul className="space-y-2.5">
                        <li className="text-sm text-slate-400">info@jobwest.eu</li>
                        <li className="text-sm text-slate-400">+421 900 123 456</li>
                        <li className="text-sm text-slate-400">Bratislava, Slovensko</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-10 pt-6 border-t border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-slate-500">
                      &copy; {new Date().getFullYear()} JobWest. Všetky práva vyhradené.
                    </p>
                    <div className="flex items-center gap-4">
                      <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Obchodné podmienky</Link>
                      <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Ochrana súkromia</Link>
                    </div>
                  </div>
                </div>
              </footer>
            </div>
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
