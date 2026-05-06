"use client"

import { useState, useEffect } from "react"
import Script from "next/script"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getSupabaseBrowserClient } from "@/lib/utils/supabase/client"
import { toast } from "sonner"
import { useGoogleAuth } from "@/hooks/use-google-auth"

const GOOGLE_GSI_SCRIPT_URL =
  process.env.NEXT_PUBLIC_GOOGLE_GSI_SCRIPT_URL ?? "https://accounts.google.com/gsi/client"

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    <path d="M1 1h22v22H1z" fill="none" />
  </svg>
);

const SignUpSchemaBase = z.object({
  email: z.string().email({ message: "Neplatný e-mail." }).trim().toLowerCase(),
  password: z
    .string()
    .min(8, { message: "Heslo musí mať aspoň 8 znakov." })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, {
      message: "Heslo musí obsahovať aspoň jedno veľké písmeno, jedno malé písmeno a jedno číslo.",
    }),
  repeatPassword: z.string(),
})

const SignUpSchema = SignUpSchemaBase.refine(
  data => data.password === data.repeatPassword,
  { message: "Heslá sa nezhodujú.", path: ["repeatPassword"] },
)

const SignInSchema = z.object({
  email: z.string().email({ message: "Neplatný e-mail." }).trim().toLowerCase(),
  password: z.string().min(1, { message: "Heslo je povinné." }),
})

type SignInValues = z.infer<typeof SignInSchema>
type SignUpValues = z.infer<typeof SignUpSchema>

export function AuthForm() {
  const supabase = getSupabaseBrowserClient()
  const { handleGoogleSignIn } = useGoogleAuth()
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [isLoginDisabled, setIsLoginDisabled] = useState(false)
  const signInForm = useForm<SignInValues>({
    resolver: zodResolver(SignInSchema),
    defaultValues: { email: "", password: "" },
  })
  const signUpForm = useForm<SignUpValues>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: { email: "", password: "", repeatPassword: "" },
  })
  const signUpEmail = signUpForm.watch("email")

  useEffect(() => {
    const checkEmail = async () => {
      if (signUpEmail) {
        const result = SignUpSchemaBase.pick({ email: true }).safeParse({
          email: signUpEmail,
        })
        if (result.success) {
          const response = await fetch("/api/check-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: signUpEmail }),
          })
          if (!response.ok) {
            signUpForm.clearErrors("email")
            return
          }
          const data = await response.json()
          if (data.exists) {
            signUpForm.setError("email", { message: "Tento e-mail je už zaregistrovaný." })
          } else {
            signUpForm.clearErrors("email")
          }
        }
      }
    }
    const debounce = setTimeout(() => { checkEmail() }, 500)
    return () => clearTimeout(debounce)
  }, [signUpEmail, signUpForm])

  const handleSignUp = async (values: SignUpValues) => {
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
    })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success("Skontrolujte si e-mail pre potvrdzovací odkaz!")
      signUpForm.reset()
    }
  }

  const handleSignIn = async (values: SignInValues) => {
    if (isLoginDisabled) {
      toast.error("Prihlasovanie je dočasne zablokované.")
      return
    }

    const { error } = await supabase.auth.signInWithPassword(values)
    if (error) {
      const newAttempts = loginAttempts + 1
      setLoginAttempts(newAttempts)
      let lockoutTime = 0
      let message = ""
      if (newAttempts === 2) { lockoutTime = 10000; message = "Príliš veľa pokusov. Skúste to znova o 10 sekúnd." }
      else if (newAttempts === 3) { lockoutTime = 30000; message = "Príliš veľa pokusov. Skúste to znova o 30 sekúnd." }
      else if (newAttempts >= 4) { lockoutTime = 60000; message = "Príliš veľa pokusov. Skúste to znova o 1 minútu." }
      if (lockoutTime > 0) {
        setIsLoginDisabled(true)
        toast.error(message)
        setTimeout(() => { setIsLoginDisabled(false); if (newAttempts >= 4) setLoginAttempts(0) }, lockoutTime)
      } else {
        toast.error(error.message === "Invalid login credentials" ? "Nesprávne prihlasovacie údaje." : error.message)
      }
    } else {
      toast.success("Prihlásenie úspešné!")
      setLoginAttempts(0)
      signInForm.reset()
    }
  }

  return (
    <>
      <Script src={GOOGLE_GSI_SCRIPT_URL} async defer />
      <div className="p-4 sm:p-6">
        <DialogHeader className="text-center mb-5">
          <DialogTitle className="text-xl font-bold">Vitajte</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm mt-1">
            Prihláste sa alebo si vytvorte účet pre pokračovanie.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted rounded-md p-1 mb-5">
            <TabsTrigger value="signin" className="rounded-sm data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm">
              Prihlásiť sa
            </TabsTrigger>
            <TabsTrigger value="signup" className="rounded-sm data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm">
              Zaregistrovať sa
            </TabsTrigger>
          </TabsList>

          <Button onClick={handleGoogleSignIn} variant="outline" className="w-full h-10 rounded-md flex items-center justify-center gap-2.5 mb-4 text-sm">
            <GoogleIcon />
            Pokračovať s Google
          </Button>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Alebo e-mailom</span>
            </div>
          </div>

          <TabsContent value="signin">
            <form onSubmit={signInForm.handleSubmit(handleSignIn)}>
              <div className="grid gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="email-signin" className="text-sm">E-mail</Label>
                  <Input id="email-signin" type="email" {...signInForm.register("email")} className="rounded-md h-10" autoComplete="username" placeholder="vas@email.sk" />
                  {signInForm.formState.errors.email && <p className="text-red-500 text-xs">{signInForm.formState.errors.email.message}</p>}
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="password-signin" className="text-sm">Heslo</Label>
                  <Input id="password-signin" type="password" {...signInForm.register("password")} className="rounded-md h-10" autoComplete="current-password" placeholder="••••••••" />
                  {signInForm.formState.errors.password && <p className="text-red-500 text-xs">{signInForm.formState.errors.password.message}</p>}
                </div>
                <Button type="submit" className="w-full h-10" disabled={isLoginDisabled}>
                  Prihlásiť sa
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={signUpForm.handleSubmit(handleSignUp)}>
              <div className="grid gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="email-signup" className="text-sm">E-mail</Label>
                  <Input id="email-signup" type="email" {...signUpForm.register("email")} className="rounded-md h-10" autoComplete="email" placeholder="vas@email.sk" />
                  {signUpForm.formState.errors.email && <p className="text-red-500 text-xs">{signUpForm.formState.errors.email.message}</p>}
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="password-signup" className="text-sm">Heslo</Label>
                  <Input id="password-signup" type="password" {...signUpForm.register("password")} className="rounded-md h-10" autoComplete="new-password" placeholder="Min. 8 znakov" />
                  {signUpForm.formState.errors.password && <p className="text-red-500 text-xs">{signUpForm.formState.errors.password.message}</p>}
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="repeatPassword-signup" className="text-sm">Zopakovať heslo</Label>
                  <Input id="repeatPassword-signup" type="password" {...signUpForm.register("repeatPassword")} className="rounded-md h-10" autoComplete="new-password" placeholder="Zopakujte heslo" />
                  {signUpForm.formState.errors.repeatPassword && <p className="text-red-500 text-xs">{signUpForm.formState.errors.repeatPassword.message}</p>}
                </div>
                <Button type="submit" className="w-full h-10">
                  Zaregistrovať sa
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
