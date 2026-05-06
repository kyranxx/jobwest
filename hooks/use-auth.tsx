"use client"

import { useEffect, useState, createContext, useContext, useMemo, useRef, useCallback } from "react"
import { getSupabaseBrowserClient } from "@/lib/utils/supabase/client"
import type { User as SupabaseUser, Session } from "@supabase/supabase-js"

type AuthContextType = {
  user: SupabaseUser | null
  loading: boolean
  signOut: () => Promise<void>
  refetch: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const CACHE_DURATION = 30 * 1000

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const cachedUserRef = useRef<SupabaseUser | null>(null)
  const cachedSessionRef = useRef<Session | null>(null)
  const lastCheckRef = useRef(0)
  const [user, setUser] = useState<SupabaseUser | null>(cachedUserRef.current)
  const [loading, setLoading] = useState(!cachedUserRef.current)
  const supabase = getSupabaseBrowserClient()
  const mounted = useRef(true)
  const initialized = useRef(false)

  const updateUser = useCallback((newUser: SupabaseUser | null, session: Session | null = null) => {
    if (!mounted.current) return
    
    cachedUserRef.current = newUser
    cachedSessionRef.current = session
    lastCheckRef.current = Date.now()
    setUser(newUser)
    setLoading(false)
  }, [])

  const checkUser = useCallback(async (force = false) => {
    if (!force && cachedUserRef.current && Date.now() - lastCheckRef.current < CACHE_DURATION) {
      if (!mounted.current) return
      setUser(cachedUserRef.current)
      setLoading(false)
      return
    }

    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        const isMissingSession =
          error.name === "AuthSessionMissingError" ||
          error.message.toLowerCase().includes("auth session missing")

        if (!isMissingSession) {
          console.error("Auth check error:", error)
        }
        updateUser(null)
        return
      }
      updateUser(user)
    } catch (error) {
      console.error("Auth check failed:", error)
      updateUser(null)
    }
  }, [supabase.auth, updateUser])

  const refetch = useCallback(() => checkUser(true), [checkUser])

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    checkUser()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted.current) return
        
        // Handle auth state changes immediately without redundant API calls
        updateUser(session?.user ?? null, session)
        
        // Clear cache on sign out
        if (event === 'SIGNED_OUT') {
          cachedUserRef.current = null
          cachedSessionRef.current = null
          lastCheckRef.current = 0
        }
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase.auth, checkUser, updateUser])

  useEffect(() => {
    return () => {
      mounted.current = false
    }
  }, [])

  const signOut = useCallback(async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Error signing out:", error)
      }
      // Clear cache
      cachedUserRef.current = null
      cachedSessionRef.current = null
      lastCheckRef.current = 0
      updateUser(null)
    } catch (error) {
      console.error("Sign out failed:", error)
      setLoading(false)
    }
  }, [supabase.auth, updateUser])

  const value = useMemo(() => ({
    user,
    loading,
    signOut,
    refetch
  }), [user, loading, signOut, refetch])

  return (
    <AuthContext.Provider value={value}>
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
