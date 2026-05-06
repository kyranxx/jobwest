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
import { useState, useEffect, memo } from "react";
import { Briefcase, BookmarkCheck, Eye, TrendingUp } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/utils/supabase/client";
import { useAuth } from "@/hooks/use-auth";

function MainDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    activeJobs: 0,
    savedJobs: 0,
    views: 0,
    memberSince: "",
  })

  useEffect(() => {
    if (!user) return
    const supabase = getSupabaseBrowserClient()

    supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .then(({ count, error }) => {
        if (!error) {
          setStats(prev => ({ ...prev, activeJobs: count ?? 0 }))
        }
      })

    setStats(prev => ({
      ...prev,
      memberSince: user?.created_at
        ? new Date(user.created_at).toLocaleDateString("sk-SK")
        : "—",
    }))
  }, [user])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Prehľad</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Vitajte na vašom účte. Tu je prehľad aktivít.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aktívne inzeráty</CardTitle>
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeJobs}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Celkový počet vašich inzerátov</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Uložené ponuky</CardTitle>
            <div className="h-8 w-8 rounded-md bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
              <BookmarkCheck className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.savedJobs}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Ponduby, ktoré ste si uložili</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Zobrazenia</CardTitle>
            <div className="h-8 w-8 rounded-md bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
              <Eye className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.views}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Celkový počet zobrazení</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Členom od</CardTitle>
            <div className="h-8 w-8 rounded-md bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-violet-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.memberSince || "—"}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Člen JobWest komunity</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Posledné aktivity</CardTitle>
          <CardDescription>Prehľad vašich nedávnych aktivít na platforme.</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.activeJobs === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Zatiaľ nemáte žiadne aktivity. Pridajte svoj prvý inzerát.
            </p>
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
