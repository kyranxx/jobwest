"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Briefcase, CreditCard, FilePlus2, LogOut, Settings, LayoutDashboard, BarChart3 } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { getSupabaseBrowserClient } from "@/lib/utils/supabase/client";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const navItems = [
  { href: "/ucet", label: "Prehľad", icon: LayoutDashboard },
  { href: "/ucet/pridat-inzerat", label: "Pridať inzerát", icon: FilePlus2 },
  { href: "/ucet/moje-inzeraty", label: "Moje inzeráty", icon: Briefcase },
  { href: "/ucet/moje-platby", label: "Moje platby", icon: CreditCard },
  { href: "/ucet/nastavenia", label: "Nastavenia", icon: Settings },
];

function DashboardNav() {
  const pathname = usePathname();
  const { signOut, user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const currentUser = user;

    if (!currentUser) {
      setIsAdmin(false);
      return;
    }

    const metadataRole = getRole(currentUser.app_metadata?.role);
    if (isAdminRole(metadataRole)) {
      setIsAdmin(true);
      return;
    }

    let cancelled = false;
    const currentUserId = currentUser.id;
    const supabase = getSupabaseBrowserClient();

    async function loadRole() {
      const { data } = await supabase
        .from("users")
        .select("role")
        .eq("id", currentUserId)
        .maybeSingle();

      if (!cancelled) {
        setIsAdmin(isAdminRole(data?.role));
      }
    }

    loadRole();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleLogout = useCallback(async () => {
    const toastId = toast.loading("Odhlasujem...");
    const result = await signOut();
    toast.dismiss(toastId);

    if (!result.ok) {
      toast.error(result.error ?? "Odhlásenie sa nepodarilo.");
      return;
    }

    toast.success("Ste odhlásený.");
    window.location.href = "/";
  }, [signOut]);

  const visibleNavItems = useMemo(
    () => [
      ...navItems,
      ...(isAdmin ? [{ href: "/admin", label: "Admin", icon: BarChart3 }] : []),
    ],
    [isAdmin],
  );

  const navLinks = useMemo(() =>
    visibleNavItems.map((item) => (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
          pathname === item.href
            ? "bg-emerald-50 text-primary"
            : "text-slate-600 hover:text-slate-950 hover:bg-slate-50"
        )}
      >
        <item.icon className="size-4" />
        {item.label}
      </Link>
    ))
  , [pathname, visibleNavItems]);

  return (
    <nav className="grid gap-1">
      <div className="flex items-center gap-2 px-3 py-2 mb-2">
        <span className="font-semibold text-sm text-slate-950">Účet JobWest</span>
      </div>
      {navLinks}
      <div className="mt-4 pt-3 border-t">
        <Button onClick={handleLogout} variant="ghost" size="sm" className="w-full justify-start text-slate-600 hover:text-destructive hover:bg-destructive/5">
          <LogOut className="mr-2 size-3.5" />
          Odhlásiť sa
        </Button>
      </div>
    </nav>
  );
}

function getRole(value: unknown) {
  return typeof value === "string" ? value : null;
}

function isAdminRole(role: string | null | undefined) {
  return role === "admin" || role === "owner";
}

export default memo(DashboardNav);
