"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/utils/supabase/client";
import { Briefcase, CreditCard, FilePlus2, LogOut, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardNav() {
  const pathname = usePathname();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const navItems = [
    { href: "/ucet", label: "Prehľad", icon: Briefcase },
    { href: "/ucet/pridat-inzerat", label: "Pridať inzerát", icon: FilePlus2 },
    { href: "/ucet/moje-inzeraty", label: "Moje inzeráty", icon: Briefcase },
    { href: "/ucet/moje-platby", label: "Moje platby", icon: CreditCard },
    { href: "/ucet/nastavenia", label: "Nastavenia", icon: Settings },
  ];

  return (
    <nav className="grid gap-2 text-lg font-medium">
      <Link
        href="/ucet"
        className="flex items-center gap-2 text-lg font-semibold"
      >
        <span className="sr-only">JobWest</span>
      </Link>
      {navItems.map((item) => (
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
      ))}
      <div className="mt-auto">
        <Button onClick={handleLogout} className="w-full">
          <LogOut className="mr-2 h-4 w-4" />
          Odhlásiť sa
        </Button>
      </div>
    </nav>
  );
}
