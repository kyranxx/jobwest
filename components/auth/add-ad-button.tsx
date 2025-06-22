"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import Link from "next/link"
import { Plus } from "lucide-react"
import { AuthForm } from "./auth-form"
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog"

export function AddAdButton({ setView }: { setView: (view: string) => void }) {
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
      authListener.subscription.unsubscribe()
    }
  }, [])

  if (user) {
    return (
      <Button
        variant="default"
        size="icon"
        className="rounded-md h-10 w-10 bg-black hover:bg-gray-800"
        title="Pridať inzerát"
        onClick={() => setView("add-ad")}
      >
        <Plus className="h-5 w-5" />
        <span className="sr-only">Pridať inzerát</span>
      </Button>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="icon"
          className="rounded-md h-10 w-10 bg-black hover:bg-gray-800"
        title="Pridať inzerát"
        >
          <Plus className="h-5 w-5" />
          <span className="sr-only">Pridať inzerát</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <AuthForm />
      </DialogContent>
    </Dialog>
  )
}
