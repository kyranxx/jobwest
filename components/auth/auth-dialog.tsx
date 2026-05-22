"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { AuthForm } from "@/components/auth/auth-form"

type AuthDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  redirectTo?: string
}

export function AuthDialog({ open, onOpenChange, redirectTo }: AuthDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 mx-4 max-h-[95vh] overflow-y-auto sm:max-w-[420px] sm:mx-0">
        <AuthForm redirectTo={redirectTo} />
      </DialogContent>
    </Dialog>
  )
}
