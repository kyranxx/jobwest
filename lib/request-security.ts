import { createHash } from "node:crypto"
import { NextResponse, type NextRequest } from "next/server"
import { siteConfig } from "@/lib/site"
import { getSupabaseServiceClient } from "@/lib/utils/supabase/service"

type RateLimitOptions = {
  key: string
  limit: number
  windowSeconds: number
  identifier?: string
}

type RateLimitRpcResult = {
  data: boolean | null
  error: { message: string } | null
}

export function enforceSameOriginRequest(request: NextRequest) {
  const origin = normalizeOrigin(request.headers.get("origin"))
  const allowedOrigins = getAllowedOrigins(request)

  if (!origin || !allowedOrigins.has(origin)) {
    return NextResponse.json({ error: "Neplatný pôvod požiadavky." }, { status: 403 })
  }

  return null
}

export async function checkRateLimit(request: NextRequest, options: RateLimitOptions) {
  const identifier = options.identifier ?? getRequesterAddress(request)
  const hashedIdentifier = createHash("sha256").update(identifier).digest("hex")
  const key = `${options.key}:${hashedIdentifier}`

  try {
    const supabase = getSupabaseServiceClient()
    const { data, error } = (await supabase.rpc("check_api_rate_limit", {
      p_key: key,
      p_limit: options.limit,
      p_window_seconds: options.windowSeconds,
    })) as RateLimitRpcResult

    if (error) {
      throw new Error(error.message)
    }

    if (data !== true) {
      return NextResponse.json(
        { error: "Príliš veľa požiadaviek. Skúste to znova neskôr." },
        { status: 429 },
      )
    }

    return null
  } catch (error) {
    console.error("Rate limit check failed:", error)

    if (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production") {
      return NextResponse.json({ error: "Služba je dočasne nedostupná." }, { status: 503 })
    }

    return null
  }
}

export function getRequesterAddress(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  const realIp = request.headers.get("x-real-ip")?.trim()

  return forwardedFor || realIp || "unknown"
}

function getAllowedOrigins(request: NextRequest) {
  const candidates = [
    request.nextUrl.origin,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    siteConfig.url,
    `https://${siteConfig.portalDomain}`,
  ]

  return new Set(candidates.map(normalizeOrigin).filter((value): value is string => Boolean(value)))
}

function normalizeOrigin(value: string | null | undefined) {
  if (!value) return null

  try {
    const url = new URL(value)
    return url.origin
  } catch {
    return null
  }
}
