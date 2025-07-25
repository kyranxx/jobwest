"use client"

import { useEffect, useState, createContext, useContext } from "react"
import { getSupabaseBrowserClient } from "@/lib/utils/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

type AuthContextType = {
  user: SupabaseUser | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    checkUser()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase.auth])

  const signOut = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Error signing out:", error)
    }
    setUser(null)
    setLoading(false)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
