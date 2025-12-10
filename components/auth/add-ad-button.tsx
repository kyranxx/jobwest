"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { Plus } from "@/components/ui/icons";
import { AuthForm } from "./auth-form"
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog"
import Link from "next/link";

export function AddAdButton() {
  const { user } = useAuth()

  if (user) {
    return (
      <Link href="/ucet/pridat-inzerat">
        <Button
          variant="default"
          size="icon"
          className="rounded-md h-10 w-10 bg-black hover:bg-dark-gray-800"
          title="Pridať inzerát"
        >
          <Plus className="h-5 w-5" />
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
          className="rounded-md h-10 w-10 bg-black hover:bg-dark-gray-800"
          title="Pridať inzerát"
        >
          <Plus className="h-5 w-5" />
          <span className="sr-only">Pridať inzerát</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Prihlásenie</DialogTitle>
          <DialogDescription>
            Pre pridanie inzerátu sa musíte prihlásiť.
          </DialogDescription>
        </DialogHeader>
        <AuthForm />
      </DialogContent>
    </Dialog>
  )
}
