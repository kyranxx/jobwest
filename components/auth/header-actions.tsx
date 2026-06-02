"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { toast } from "sonner"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Plus, User } from "@/components/ui/icons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/use-auth"

const AuthDialog = dynamic(() => import("@/components/auth/auth-dialog").then((mod) => mod.AuthDialog), {
  ssr: false,
  loading: () => null,
})

export function HeaderActions() {
  const { user, loading } = useAuth()
  const [dialog, setDialog] = useState<null | "account" | "add">(null)
  const isOpen = dialog !== null
  const displayName = getDisplayName(user)
  const avatarUrl = getAvatarUrl(user)
  const initials = getInitials(displayName)

  const openDialog = (nextDialog: "account" | "add") => {
    setDialog(nextDialog)
    toast.info(nextDialog === "add" ? "Najprv sa prihláste." : "Otvorené prihlásenie.")
  }

  return (
    <>
      {loading ? (
        <Button
          variant="ghost"
          size="sm"
          className="h-9 px-2 text-[#241033] hover:bg-[#f3f1ee] sm:px-3"
          title="Načítavam účet"
          data-cy="user-button"
          disabled
        >
          <User className="size-4" />
          <span className="hidden sm:inline">Účet</span>
        </Button>
      ) : user ? (
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="size-9 rounded-full p-0 text-[#241033] hover:bg-[#f3f1ee]"
          title={displayName}
          data-cy="user-button"
          onClick={() => toast.info("Otváram účet.")}
        >
          <Link href="/ucet" prefetch={false}>
            <Avatar className="size-8 border border-[#e4dfd8]">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
              <AvatarFallback className="bg-[#f3f1ee] text-xs font-semibold text-[#241033]">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="sr-only">Otvoriť účet</span>
          </Link>
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="h-9 px-2 text-[#241033] hover:bg-[#f3f1ee] sm:px-3"
          title="Prihlásiť sa"
          data-cy="user-button"
          onClick={() => openDialog("account")}
        >
          <User className="size-4" />
          <span className="hidden sm:inline">Prihlásiť sa</span>
        </Button>
      )}
      {user ? (
        <Button
          asChild
          variant="default"
          size="sm"
          className="h-9 rounded-md px-3 shadow-[0_8px_22px_rgba(76,24,92,0.18)]"
          title="Pridať inzerát"
          data-cy="employer-add-ad-button"
          onClick={() => toast.info("Otváram pridanie inzerátu.")}
        >
          <Link href="/ucet/pridat-inzerat" prefetch={false}>
            <Plus className="size-4" />
            <span className="hidden sm:inline">Pridať inzerát</span>
          </Link>
        </Button>
      ) : (
        <Button
          variant="default"
          size="sm"
          className="h-9 rounded-md px-3 shadow-[0_8px_22px_rgba(76,24,92,0.18)]"
          title="Pridať inzerát"
          data-cy="employer-add-ad-button"
          onClick={() => openDialog("add")}
        >
          <Plus className="size-4" />
          <span className="hidden sm:inline">Pridať inzerát</span>
        </Button>
      )}
      {isOpen && (
        <AuthDialog
          open={isOpen}
          onOpenChange={(open) => {
            if (!open) setDialog(null)
          }}
          redirectTo={dialog === "add" ? "/ucet/pridat-inzerat" : "/ucet"}
        />
      )}
    </>
  )
}

function getDisplayName(user: SupabaseUser | null) {
  if (!user) return "Účet"

  return (
    getString(user.user_metadata?.full_name) ??
    getString(user.user_metadata?.name) ??
    user.email ??
    "Účet"
  )
}

function getAvatarUrl(user: SupabaseUser | null) {
  if (!user) return null

  return getString(user.user_metadata?.avatar_url) ?? getString(user.user_metadata?.picture)
}

function getString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null
}

function getInitials(value: string) {
  const words = value
    .split(/\s+/)
    .map((word) => word[0])
    .filter(Boolean)

  return words.slice(0, 2).join("").toUpperCase() || "JW"
}
