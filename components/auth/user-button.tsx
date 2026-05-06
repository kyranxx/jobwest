"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { AuthForm } from "./auth-form";
import { User, LogOut } from "@/components/ui/icons";
import Link from "next/link";
import { getUserProfile } from "@/lib/utils/supabase/user";
import { signOut } from "@/app/auth/actions";

export function UserButton() {
  const { user } = useAuth()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      getUserProfile(user).then(profile => {
        setAvatarUrl(profile?.image || user.user_metadata.picture || null);
      });
    } else {
      setAvatarUrl(null);
    }
  }, [user]);

  if (user) {
    return (
      <div className="flex items-center gap-0.5">
        <Link href="/ucet">
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-7 w-7">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={user.user_metadata.name || ''} />}
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {user.email?.[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </Link>
        <form action={signOut}>
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            title="Odhlásiť sa"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </div>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="icon"
          className="h-8 w-8"
          title="Prihlásiť sa"
          data-cy="user-button"
        >
          <User className="h-4 w-4" />
          <span className="sr-only">Prihlásiť sa</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px] p-0 gap-0 mx-4 sm:mx-0 max-h-[95vh] overflow-y-auto">
        <AuthForm />
      </DialogContent>
    </Dialog>
  )
}
