"use client"

import { useState, useEffect } from "react"
import Script from "next/script"
import { z } from "zod"
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

const SignUpSchemaBase = z.object({
  email: z.string().email({ message: "Neplatný email." }).trim().toLowerCase(),
  password: z
    .string()
    .min(8, { message: "Heslo musí mať aspoň 8 znakov." })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, {
      message:
        "Heslo musí obsahovať aspoň jedno veľké písmeno, jedno malé písmeno a jedno číslo.",
    }),
  repeatPassword: z.string(),
})

export function AuthForm() {
  const supabase = getSupabaseBrowserClient()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    repeatPassword: "",
  })
  const [formErrors, setFormErrors] = useState({
    email: "",
    password: "",
    repeatPassword: "",
  })
  const { handleGoogleSignIn } = useGoogleAuth()
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [isLoginDisabled, setIsLoginDisabled] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  useEffect(() => {
    const checkEmail = async () => {
      if (formData.email) {
        const result = SignUpSchemaBase.pick({ email: true }).safeParse({
          email: formData.email,
        })
        if (result.success) {
          const response = await fetch("/api/check-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: formData.email }),
          })
          const data = await response.json()
          if (data.exists) {
            setFormErrors(prev => ({
              ...prev,
              email: "Tento email je už zaregistrovaný.",
            }))
          } else {
            setFormErrors(prev => ({ ...prev, email: "" }))
          }
        }
      }
    }
    const debounce = setTimeout(() => {
      checkEmail()
    }, 500)
    return () => clearTimeout(debounce)
  }, [formData.email])

  const SignUpSchema = SignUpSchemaBase.refine(
    data => data.password === data.repeatPassword,
    {
      message: "Heslá sa nezhodujú.",
      path: ["repeatPassword"],
    },
  )

  const SignInSchema = z.object({
    email: z.string().email({ message: "Neplatný email." }).trim().toLowerCase(),
    password: z.string().min(1, { message: "Heslo je povinné." }),
  })

  const handleSignUp = async () => {
    setFormErrors({ email: "", password: "", repeatPassword: "" })
    const result = SignUpSchema.safeParse(formData)
    if (!result.success) {
      const newErrors = { email: "", password: "", repeatPassword: "" };
      result.error.errors.forEach(err => {
        if (err.path) {
          newErrors[err.path[0] as keyof typeof newErrors] = err.message;
        }
      });
      setFormErrors(newErrors);
      return
    }

    const { error } = await supabase.auth.signUp(result.data)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success("Skontrolujte si email pre potvrdzovací odkaz!")
    }
  }

  const handleSignIn = async () => {
    if (isLoginDisabled) {
      toast.error("Prihlasovanie je dočasne zablokované.")
      return
    }
    setFormErrors({ email: "", password: "", repeatPassword: "" })
    const result = SignInSchema.safeParse(formData)
    if (!result.success) {
      const newErrors = { email: "", password: "", repeatPassword: "" };
      result.error.errors.forEach(err => {
        if (err.path) {
          newErrors[err.path[0] as keyof typeof newErrors] = err.message;
        }
      });
      setFormErrors(newErrors);
      return
    }

    const { error } = await supabase.auth.signInWithPassword(result.data)
    if (error) {
      const newAttempts = loginAttempts + 1
      setLoginAttempts(newAttempts)

      let lockoutTime = 0
      let message = ""

      if (newAttempts === 2) {
        lockoutTime = 10000 // 10 seconds
        message = "Príliš veľa pokusov. Skúste to znova o 10 sekúnd."
      } else if (newAttempts === 3) {
        lockoutTime = 30000 // 30 seconds
        message = "Príliš veľa pokusov. Skúste to znova o 30 sekúnd."
      } else if (newAttempts >= 4) {
        lockoutTime = 60000 // 1 minute
        message = "Príliš veľa pokusov. Skúste to znova o 1 minútu."
      }

      if (lockoutTime > 0) {
        setIsLoginDisabled(true)
        toast.error(message)
        setTimeout(() => {
          setIsLoginDisabled(false)
          if (newAttempts >= 4) {
            setLoginAttempts(0)
          }
        }, lockoutTime)
      } else {
        if (error.message === "Invalid login credentials") {
          toast.error("Nesprávne prihlasovacie údaje.")
        } else {
          toast.error(error.message)
        }
      }
    } else {
      toast.success("Prihlásenie úspešné!")
      setLoginAttempts(0)
    }
  }

  return (
    <>
      <Script
        src={process.env.NEXT_PUBLIC_GOOGLE_GSI_SCRIPT_URL}
        async
        defer
      />
      <div className="p-4 sm:p-6">
        <DialogHeader className="text-center">
        <DialogTitle className="text-2xl font-bold text-blue-700">Vitajte</DialogTitle>
        <DialogDescription>
          Prihláste sa alebo si vytvorte účet pre pokračovanie.
        </DialogDescription>
      </DialogHeader>
      <Tabs defaultValue="signin" className="pt-4">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-lg">
          <TabsTrigger value="signin" className="data-[state=active]:bg-blue-700 data-[state=active]:text-white rounded-md">Prihlásiť sa</TabsTrigger>
          <TabsTrigger value="signup" className="data-[state=active]:bg-blue-700 data-[state=active]:text-white rounded-md">Zaregistrovať sa</TabsTrigger>
        </TabsList>
        <div className="grid gap-4 pt-4">
          <Button onClick={handleGoogleSignIn} className="w-full flex items-center gap-2 bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
            <GoogleIcon />
            Pokračovať s Google
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">
                  Alebo pokračujte s emailom
                </span>
              </div>
            </div>
        </div>
        <TabsContent value="signin">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSignIn()
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email-signin">Email</Label>
                <Input
                  id="email-signin"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="rounded-lg"
                  autoComplete="username"
                />
                {formErrors.email && <p className="text-red-500 text-sm">{formErrors.email}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password-signin">Heslo</Label>
                <Input
                  id="password-signin"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="rounded-lg"
                  autoComplete="current-password"
                />
                {formErrors.password && <p className="text-red-500 text-sm">{formErrors.password}</p>}
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-700 hover:bg-blue-800 text-white rounded-lg"
                disabled={isLoginDisabled}
              >
                Prihlásiť sa
              </Button>
            </div>
          </form>
        </TabsContent>
        <TabsContent value="signup">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSignUp()
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email-signup">Email</Label>
                <Input
                  id="email-signup"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="rounded-lg"
                  autoComplete="email"
                />
                {formErrors.email && <p className="text-red-500 text-sm">{formErrors.email}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password-signup">Heslo</Label>
                <Input
                  id="password-signup"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="rounded-lg"
                  autoComplete="new-password"
                />
                {formErrors.password && <p className="text-red-500 text-sm">{formErrors.password}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="repeatPassword-signup">Zopakovať heslo</Label>
                <Input
                  id="repeatPassword-signup"
                  name="repeatPassword"
                  type="password"
                  value={formData.repeatPassword}
                  onChange={handleInputChange}
                  className="rounded-lg"
                  autoComplete="new-password"
                />
                {formErrors.repeatPassword && <p className="text-red-500 text-sm">{formErrors.repeatPassword}</p>}
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-700 hover:bg-blue-800 text-white rounded-lg"
              >
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
