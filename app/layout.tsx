import type React from "react";
import "@/app/globals.css";
import "./flags.css";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"
import Link from "next/link"
import Image from "next/image"
import { AddAdButton } from "@/components/auth/add-ad-button"
import { UserButton } from "@/components/auth/user-button"

const inter = Inter({ subsets: ["latin", "latin-ext"] })

export const metadata = {
  title: "PrácaVZahraničí - Nájdite si prácu v zahraničí",
  description: "Prehliadajte pracovné ponuky v zahraničí",
  icons: {
    icon: "/favicon.ico",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="sk" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <header className="h-16 border-b bg-white px-4 py-2 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center">
              <Link href="/">
                <Image src="/logo.png" alt="JobWest Logo" width={150} height={50} className="h-12 w-auto" priority />
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <AddAdButton />
              <UserButton />
            </div>
          </header>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
