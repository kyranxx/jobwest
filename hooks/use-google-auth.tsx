"use client"

import { getSupabaseBrowserClient } from "@/lib/utils/supabase/client"
import { toast } from "sonner"

export function useGoogleAuth() {
  const supabase = getSupabaseBrowserClient()

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      toast.error(error.message)
    }
  }

  return { handleGoogleSignIn }
}
