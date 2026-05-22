"use server"

import { getSupabaseServerClient } from "@/lib/utils/supabase/server"
import { redirect } from "next/navigation"

async function auth() {
  const supabase = getSupabaseServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return { session, supabase }
}

export async function signOut() {
  const session = await auth()

  if (!session.session) {
    redirect("/")
  }

  const { error } = await session.supabase.auth.signOut()
  
  if (error) {
    console.error("Error signing out:", error)
    // Still redirect to home even if sign out fails
  }
  
  // Redirect to home page after sign out
  redirect("/")
}
