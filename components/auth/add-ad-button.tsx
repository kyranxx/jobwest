"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/utils/supabase/client"
import type { User } from "@supabase/supabase-js";
import { Plus } from "lucide-react";
import { AuthForm } from "./auth-form"
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog"
import Link from "next/link";

export function AddAdButton() {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    // Initial check
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

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
