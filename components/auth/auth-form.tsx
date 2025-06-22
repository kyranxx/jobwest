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
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { GoogleIcon } from "../ui/google-icon"

export function AuthForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSignInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    })
    if (error) {
      toast.error(error.message)
    }
  }

  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) {
      toast.error(error.message)
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
      toast.error(error.message)
    } else {
      toast.success("Prihlásenie úspešné!")
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
        <TabsContent value="signin">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email-signin" className="text-right">
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password-signin" className="text-right">
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
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Alebo pokračujte s
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleSignInWithGoogle}
            >
              <GoogleIcon className="mr-2 h-4 w-4" />
              Google
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="signup">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email-signup" className="text-right">
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password-signup" className="text-right">
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
            <Button onClick={handleSignUp} className="w-full">
              Zaregistrovať sa
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Alebo pokračujte s
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleSignInWithGoogle}
            >
              <GoogleIcon className="mr-2 h-4 w-4" />
              Google
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </>
  )
}
