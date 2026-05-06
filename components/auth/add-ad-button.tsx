"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { Plus } from "@/components/ui/icons";
import { AuthForm } from "./auth-form"
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog"
import Link from "next/link";

export function AddAdButton() {
  const { user } = useAuth()

  if (user) {
    return (
      <Link href="/ucet/pridat-inzerat">
        <Button
          variant="default"
          size="icon"
          className="h-8 w-8"
          title="Pridať inzerát"
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">Pridať inzerát</span>
        </Button>
      </Link>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="icon"
          className="h-8 w-8"
          title="Pridať inzerát"
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">Pridať inzerát</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px] p-0 gap-0 mx-4 sm:mx-0 max-h-[95vh] overflow-y-auto">
        <AuthForm />
      </DialogContent>
    </Dialog>
  )
}
