"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"

const AuthDialog = dynamic(() => import("@/components/auth/auth-dialog").then((mod) => mod.AuthDialog), {
  ssr: false,
  loading: () => null,
})

export function EmployerCtaButton({
  className,
  label = "Pridať inzerát",
}: {
  className?: string
  label?: string
}) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const content = (
    <>
      {label}
      <ArrowRight className="size-4" />
    </>
  )
  const handleClick = () => {
    if (user) {
      toast.info("Otváram pridanie inzerátu.")
      router.push("/ucet/pridat-inzerat")
      return
    }

    toast.info("Najprv sa prihláste.")
    setOpen(true)
  }

  return (
    <>
      <Button className={className} data-cy="employer-add-ad-button" onClick={handleClick} disabled={loading}>
        {content}
      </Button>
      {open && <AuthDialog open={open} onOpenChange={setOpen} redirectTo="/ucet/pridat-inzerat" />}
    </>
  )
}
