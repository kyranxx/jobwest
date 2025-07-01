"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/utils/supabase/client"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { AuthForm } from "./auth-form";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { User } from "lucide-react";

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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  if (user) {
    return (
      <Button variant="ghost" className="relative h-8 w-8 rounded-full" asChild>
        <a href="/dashboard">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.user_metadata.avatar_url} alt={user.user_metadata.name} />
            <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
          </Avatar>
        </a>
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
          title="Prihlásiť sa"
          data-cy="user-button"
        >
          <User className="h-5 w-5" />
          <span className="sr-only">Prihlásiť sa</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <AuthForm />
      </DialogContent>
    </Dialog>
  )
}
