"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Briefcase, CreditCard, FilePlus2, LogOut, Settings } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { memo, useCallback, useMemo } from "react";

const navItems = [
  { href: "/ucet", label: "Prehľad", icon: Briefcase },
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
          "mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground",
          {
            "bg-muted text-foreground": pathname === item.href,
          }
        )}
      >
        <item.icon className="h-5 w-5" />
        {item.label}
      </Link>
    ))
  , [pathname]);

  return (
    <nav className="grid gap-2 text-lg font-medium">
      <Link
        href="/ucet"
        className="flex items-center gap-2 text-lg font-semibold"
      >
        <span className="sr-only">JobWest</span>
      </Link>
      {navLinks}
      <div className="mt-auto">
        <Button onClick={handleLogout} className="w-full">
          <LogOut className="mr-2 h-4 w-4" />
          Odhlásiť sa
        </Button>
      </div>
    </nav>
  );
}

export default memo(DashboardNav);
