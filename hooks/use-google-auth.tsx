"use client"

import { createClient } from "@/lib/utils/supabase/client"
import { toast } from "sonner"

export function useGoogleAuth() {
  const supabase = createClient()

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    })
    if (error) {
      toast.error(error.message)
    }
  }

  return { handleGoogleSignIn }
}
