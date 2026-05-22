"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useEffect, memo, useRef } from "react";
import { Briefcase, BookmarkCheck, Eye, Plus, TrendingUp } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/utils/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type DashboardStats = {
  activeJobs: number
  savedJobs: number
  views: number
  memberSince: string
}

function MainDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const hasShownLoadedToast = useRef(false)

  useEffect(() => {
    if (!user) {
      setStats(null)
      return
    }

    let cancelled = false
    const supabase = getSupabaseBrowserClient()
    const currentUser = user

    async function loadStats() {
      const { count, error } = await supabase
        .from("jobs")
        .select("id", { count: "exact", head: true })
        .eq("user_id", currentUser.id)

      if (cancelled) return

      const savedJobs = (() => {
        try {
          const rawValue = window.localStorage.getItem("jobwest:saved-jobs")
          const parsedValue = rawValue ? JSON.parse(rawValue) : []
          return Array.isArray(parsedValue) ? parsedValue.length : 0
        } catch {
          return 0
        }
      })()

      setStats({
        activeJobs: error ? 0 : count ?? 0,
        savedJobs,
        views: 0,
        memberSince: currentUser.created_at
          ? new Date(currentUser.created_at).toLocaleDateString("sk-SK")
          : "—",
      })

      if (!hasShownLoadedToast.current) {
        hasShownLoadedToast.current = true
        toast.success("Prehľad účtu je načítaný", { duration: 1800 })
      }
    }

    loadStats()

    return () => {
      cancelled = true
    }
  }, [user])

  const dashboardStats = stats ?? {
    activeJobs: "—",
    savedJobs: "—",
    views: "—",
    memberSince: user?.created_at
      ? new Date(user.created_at).toLocaleDateString("sk-SK")
      : "—",
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Nástenka</h1>
            <p className="text-slate-600 text-sm mt-1">
              Rýchly prehľad účtu, inzerátov a zvýraznení.
            </p>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/ucet/pridat-inzerat">
              <Plus className="size-4" />
              Pridať inzerát
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 gap-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">Aktívne inzeráty</CardTitle>
            <div className="size-8 rounded-md bg-emerald-50 flex items-center justify-center">
              <Briefcase className="size-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-slate-950">{dashboardStats.activeJobs}</div>
            <p className="text-xs text-slate-500 mt-1">Publikované pracovné ponuky</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 gap-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">Uložené ponuky</CardTitle>
            <div className="size-8 rounded-md bg-slate-100 flex items-center justify-center">
              <BookmarkCheck className="size-4 text-slate-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-slate-950">{dashboardStats.savedJobs}</div>
            <p className="text-xs text-slate-500 mt-1">Ponuky odložené na neskôr</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 gap-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">Zobrazenia</CardTitle>
            <div className="size-8 rounded-md bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
              <Eye className="size-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-slate-950">{dashboardStats.views}</div>
            <p className="text-xs text-slate-500 mt-1">Pripravené pre analytiku</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 gap-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">Členom od</CardTitle>
            <div className="size-8 rounded-md bg-amber-50 flex items-center justify-center">
              <TrendingUp className="size-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-slate-950">{dashboardStats.memberSince || "—"}</div>
            <p className="text-xs text-slate-500 mt-1">Dátum vytvorenia účtu</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Stav účtu</CardTitle>
          <CardDescription>Najdôležitejšie veci, ktoré môžete spraviť hneď teraz.</CardDescription>
        </CardHeader>
        <CardContent>
          {!stats ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
              Načítavam stav účtu...
            </div>
          ) : stats.activeJobs === 0 ? (
            <div className="flex flex-col gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-950">Začnite prvým inzerátom</p>
                <p className="text-sm text-slate-600 mt-0.5">Ponuku môžete pridať zdarma a zvýraznenie zapnúť neskôr.</p>
              </div>
              <Button asChild variant="outline" className="bg-white">
                <Link href="/ucet/pridat-inzerat">Pridať inzerát</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-muted-foreground">Dátum</TableHead>
                  <TableHead className="text-muted-foreground">Aktivita</TableHead>
                  <TableHead className="text-muted-foreground">Stav</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="text-sm">{stats.memberSince || "—"}</TableCell>
                  <TableCell className="text-sm">Vytvorený účet</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700">
                      Aktívny
                    </span>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default memo(MainDashboard);
