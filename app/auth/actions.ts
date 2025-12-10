"use server"

import { getSupabaseServerClient } from "@/lib/utils/supabase/server"
import { redirect } from "next/navigation"

export async function signOut() {
  const supabase = getSupabaseServerClient()
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error("Error signing out:", error)
    // Still redirect to home even if sign out fails
  }
  
  // Redirect to home page after sign out
  redirect("/")
}
