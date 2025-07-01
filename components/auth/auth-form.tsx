"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import * as Sentry from "@sentry/nextjs";
import { createClient } from "@/lib/utils/supabase/client"
import { toast } from "sonner"

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
    <path d="M1 1h22v22H1z" fill="none" />
  </svg>
);

export function AuthForm() {
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")

  const handleSignUp = async () => {
    if (password !== repeatPassword) {
      toast.error("Heslá sa nezhodujú.")
      return
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) {
      toast.error(error.message);
      Sentry.captureException(error);
    } else {
      toast.success("Skontrolujte si email pre potvrdzovací odkaz!")
    }
  }

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      toast.error(error.message);
      Sentry.captureException(error);
    } else {
      toast.success("Prihlásenie úspešné!")
    }
  }

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    })
    if (error) {
      toast.error(error.message);
      Sentry.captureException(error);
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Vitajte</DialogTitle>
        <DialogDescription>
          Prihláste sa alebo si vytvorte účet pre pokračovanie.
        </DialogDescription>
      </DialogHeader>
      <Tabs defaultValue="signin" className="pt-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Prihlásiť sa</TabsTrigger>
          <TabsTrigger value="signup">Zaregistrovať sa</TabsTrigger>
        </TabsList>
        <div className="grid gap-4 pt-4">
          <Button onClick={handleGoogleSignIn} className="w-full flex items-center gap-2" variant="outline">
            <GoogleIcon />
            Pokračovať s Google
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Alebo pokračujte s emailom
                </span>
              </div>
            </div>
        </div>
        <TabsContent value="signin">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="email-signin" className="sm:text-right">
                Email
              </Label>
              <Input
                id="email-signin"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="password-signin" className="sm:text-right">
                Heslo
              </Label>
              <Input
                id="password-signin"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="col-span-3"
                autoComplete="new-password"
              />
            </div>
            <Button onClick={handleSignIn} className="w-full">
              Prihlásiť sa
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="signup">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="email-signup" className="sm:text-right">
                Email
              </Label>
              <Input
                id="email-signup"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="password-signup" className="sm:text-right">
                Heslo
              </Label>
              <Input
                id="password-signup"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="col-span-3"
                autoComplete="new-password"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="repeat-password-signup" className="sm:text-right">
                Zopakovať heslo
              </Label>
              <Input
                id="repeat-password-signup"
                type="password"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                className="col-span-3"
                autoComplete="new-password"
              />
            </div>
            <Button onClick={handleSignUp} className="w-full">
              Zaregistrovať sa
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </>
  )
}
