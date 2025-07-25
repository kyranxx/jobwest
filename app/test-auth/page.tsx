"use client"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function TestAuthPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  if (loading) {
    return <div>Načítavanie...</div>
  }

  if (!user) {
    return <div>Presmerovanie na prihlásenie...</div>
  }

  return (
    <div className="p-8">
      <h1>Test autentifikácie</h1>
      <p>Prihlásený používateľ: {user.email}</p>
      <button 
        onClick={signOut}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg"
      >
        Odhlásiť sa
      </button>
    </div>
  )
}
