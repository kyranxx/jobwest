import { NextResponse, type NextRequest } from "next/server"
import { getRequesterAddress } from "@/lib/request-security"

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"

type TurnstileVerifyResponse = {
  success?: boolean
  "error-codes"?: string[]
}

export async function verifyTurnstileToken(request: NextRequest, token: string | undefined) {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim()

  if (!secret) {
    if (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production") {
      return NextResponse.json({ error: "Bezpečnostné overenie nie je nakonfigurované." }, { status: 503 })
    }

    return null
  }

  if (!token) {
    return NextResponse.json({ error: "Potvrďte bezpečnostné overenie." }, { status: 403 })
  }

  const body = new URLSearchParams({ secret, response: token })
  const requesterAddress = getRequesterAddress(request)

  if (requesterAddress !== "unknown") {
    body.set("remoteip", requesterAddress)
  }

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    })
    const data = (await response.json().catch(() => null)) as TurnstileVerifyResponse | null

    if (response.ok && data?.success === true) {
      return null
    }

    console.error("Turnstile verification failed:", data?.["error-codes"] ?? response.status)
    return NextResponse.json({ error: "Bezpečnostné overenie zlyhalo." }, { status: 403 })
  } catch (error) {
    console.error("Turnstile verification error:", error)
    return NextResponse.json({ error: "Bezpečnostné overenie je dočasne nedostupné." }, { status: 503 })
  }
}
