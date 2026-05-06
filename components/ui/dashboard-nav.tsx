"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Briefcase, CreditCard, FilePlus2, LogOut, Settings, LayoutDashboard } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { memo, useCallback, useMemo } from "react";

const navItems = [
  { href: "/ucet", label: "Prehľad", icon: LayoutDashboard },
  { href: "/ucet/pridat-inzerat", label: "Pridať inzerát", icon: FilePlus2 },
  { href: "/ucet/moje-inzeraty", label: "Moje inzeráty", icon: Briefcase },
  { href: "/ucet/moje-platby", label: "Moje platby", icon: CreditCard },
  { href: "/ucet/nastavenia", label: "Nastavenia", icon: Settings },
];

function DashboardNav() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  const handleLogout = useCallback(async () => {
    await signOut();
    window.location.href = "/";
  }, [signOut]);

  const navLinks = useMemo(() =>
    navItems.map((item) => (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
          pathname === item.href
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        )}
      >
        <item.icon className="h-4 w-4" />
        {item.label}
      </Link>
    ))
  , [pathname]);

  return (
    <nav className="grid gap-0.5">
      <div className="flex items-center gap-2 px-2.5 py-2 mb-3">
        <span className="font-semibold text-sm">Nástenka</span>
      </div>
      {navLinks}
      <div className="mt-4 pt-3 border-t">
        <Button onClick={handleLogout} variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/5">
          <LogOut className="mr-2 h-3.5 w-3.5" />
          Odhlásiť sa
        </Button>
      </div>
    </nav>
  );
}

export default memo(DashboardNav);
