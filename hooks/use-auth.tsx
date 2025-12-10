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

// Cache auth state to avoid redundant API calls
let cachedUser: SupabaseUser | null = null
let cachedSession: Session | null = null
let lastCheck = 0
const CACHE_DURATION = 30 * 1000 // 30 seconds

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(cachedUser)
  const [loading, setLoading] = useState(!cachedUser)
  const supabase = getSupabaseBrowserClient()
  const mounted = useRef(true)
  const initialized = useRef(false)

  const updateUser = useCallback((newUser: SupabaseUser | null, session: Session | null = null) => {
    if (!mounted.current) return
    
    cachedUser = newUser
    cachedSession = session
    lastCheck = Date.now()
    setUser(newUser)
    setLoading(false)
  }, [])

  const checkUser = useCallback(async (force = false) => {
    if (!force && cachedUser && Date.now() - lastCheck < CACHE_DURATION) {
      // Use cached data if available and recent
      if (!mounted.current) return
      setUser(cachedUser)
      setLoading(false)
      return
    }

    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        console.error("Auth check error:", error)
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
          cachedUser = null
          cachedSession = null
          lastCheck = 0
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
      cachedUser = null
      cachedSession = null
      lastCheck = 0
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
