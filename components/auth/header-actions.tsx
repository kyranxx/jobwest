"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Plus, User } from "@/components/ui/icons"

const AuthDialog = dynamic(() => import("@/components/auth/auth-dialog").then((mod) => mod.AuthDialog), {
  ssr: false,
  loading: () => null,
})

export function HeaderActions() {
  const [dialog, setDialog] = useState<null | "account" | "add">(null)
  const isOpen = dialog !== null

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-9 px-2 text-[#241033] hover:bg-[#f3f1ee] sm:px-3"
        title="Prihlásiť sa"
        data-cy="user-button"
        onClick={() => setDialog("account")}
      >
        <User className="size-4" />
        <span className="hidden sm:inline">Prihlásiť sa</span>
      </Button>
      <Button
        variant="default"
        size="sm"
        className="h-9 rounded-md px-3 shadow-[0_8px_22px_rgba(76,24,92,0.18)]"
        title="Pridať inzerát"
        data-cy="employer-add-ad-button"
        onClick={() => setDialog("add")}
      >
        <Plus className="size-4" />
        <span className="hidden sm:inline">Pridať inzerát</span>
      </Button>
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
