"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { getSupabaseBrowserClient } from "@/lib/utils/supabase/client"
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { AuthForm } from "./auth-form";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { User } from "@/components/ui/icons";
import Link from "next/link";
import { getUserProfile } from "@/lib/utils/supabase/user";

export function UserButton() {
  const supabase = getSupabaseBrowserClient()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const profile = await getUserProfile(user);
        setAvatarUrl(profile?.image || user.user_metadata.picture || null);
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          getUserProfile(currentUser).then(profile => {
            setAvatarUrl(profile?.image || currentUser.user_metadata.picture || null);
          });
        } else {
          setAvatarUrl(null);
        }
      }
    );

    fetchUserAndProfile();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  if (user) {
    return (
      <Link href="/ucet">
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={user.user_metadata.name || ''} />}
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
