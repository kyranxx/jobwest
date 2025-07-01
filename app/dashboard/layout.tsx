"use client"

import * as React from "react"
import Link from "next/link"
import {
  Briefcase,
  Settings,
  FilePlus2,
  CreditCard,
  LayoutDashboard,
  LogOut,
} from "lucide-react"
import { createClient } from "@/lib/utils/supabase/client"
import { Button } from "@/components/ui/button"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="/"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <Briefcase className="h-4 w-4 transition-all group-hover:scale-110" />
            <span className="sr-only">JobWest</span>
          </Link>
          <Link
            href="/dashboard"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="sr-only">Dashboard</span>
          </Link>
          <Link
            href="/dashboard/add-ad"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
          >
            <FilePlus2 className="h-5 w-5" />
            <span className="sr-only">Pridať inzerát</span>
          </Link>
          <Link
            href="/dashboard/my-ads"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
          >
            <Briefcase className="h-5 w-5" />
            <span className="sr-only">Moje inzeráty</span>
          </Link>
          <Link
            href="/dashboard/payments"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
          >
            <CreditCard className="h-5 w-5" />
            <span className="sr-only">Moje platby</span>
          </Link>
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="/dashboard/settings"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
          >
            <Settings className="h-5 w-5" />
            <span className="sr-only">Nastavenia</span>
          </Link>
          <Button
            onClick={handleLogout}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
            variant="ghost"
          >
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Odhlásiť sa</span>
          </Button>
        </nav>
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <h1 className="text-xl font-semibold">Dashboard</h1>
        </header>
        <main className="flex-1 p-4 sm:px-6 sm:py-0">{children}</main>
      </div>
    </div>
  )
}
