import { NextResponse, type NextRequest } from 'next/server'
import { buildContentSecurityPolicy } from '@/lib/csp'

export async function middleware(request: NextRequest) {
  const cspHeaderValue = buildContentSecurityPolicy({
    isDevelopment: process.env.NODE_ENV === 'development',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  })

  const response = NextResponse.next()

  response.headers.set('Content-Security-Policy', cspHeaderValue)

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
