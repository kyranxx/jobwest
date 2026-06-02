import { NextResponse, type NextRequest } from 'next/server'
import { buildContentSecurityPolicy } from '@/lib/csp'
import { getSecurityHeaders } from '@/lib/security-headers'

export async function middleware(request: NextRequest) {
  const cspHeaderValue = buildContentSecurityPolicy({
    isDevelopment: process.env.NODE_ENV === 'development',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  })

  const response = NextResponse.next()

  response.headers.set('Content-Security-Policy', cspHeaderValue)
  for (const [name, value] of Object.entries(getSecurityHeaders())) {
    response.headers.set(name, value)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
