"use client"

import * as React from "react"
import Link from "next/link"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { PanelLeft, Briefcase, Settings, FilePlus2 } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <Briefcase className="w-6 h-6" />
              <h1 className="text-lg font-semibold">JobWest</h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard/add-ad">
                    <FilePlus2 className="w-5 h-5" />
                    Pridať inzerát
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard/my-ads">
                    <Briefcase className="w-5 h-5" />
                    Moje inzeráty
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard/payments">
                    <Briefcase className="w-5 h-5" />
                    Moje platby
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard/settings">
                    <Settings className="w-5 h-5" />
                    Nastavenia
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 p-4">
          <div className="flex items-center gap-4 mb-4">
            <SidebarTrigger>
              <PanelLeft className="w-6 h-6" />
            </SidebarTrigger>
            <h1 className="text-xl font-semibold">Dashboard</h1>
          </div>
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}
