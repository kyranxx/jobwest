"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

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
  const [open, setOpen] = useState(false)
  const content = (
    <>
      {label}
      <ArrowRight className="size-4" />
    </>
  )

  return (
    <>
      <Button className={className} data-cy="employer-add-ad-button" onClick={() => setOpen(true)}>{content}</Button>
      {open && <AuthDialog open={open} onOpenChange={setOpen} redirectTo="/ucet/pridat-inzerat" />}
    </>
  )
}
