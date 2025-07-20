"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/utils/supabase/client"
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { AuthForm } from "./auth-form";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { User } from "lucide-react";
import Link from "next/link";

export function UserButton() {
  const supabase = createClient()
  const [user, setUser] = useState<SupabaseUser | null>(null)

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
      <Link href="/ucet">
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.user_metadata.avatar_url} alt={user.user_metadata.name} />
            <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
          </Avatar>
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
          title="Prihlásiť sa"
          data-cy="user-button"
        >
          <User className="h-5 w-5" />
          <span className="sr-only">Prihlásiť sa</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Prihlásenie</DialogTitle>
          <DialogDescription>
            Pre pokračovanie sa musíte prihlásiť.
          </DialogDescription>
        </DialogHeader>
        <AuthForm />
      </DialogContent>
    </Dialog>
  )
}
