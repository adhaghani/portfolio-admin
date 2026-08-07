import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Next.js proxy — adds security headers to all matching requests.
 *
 * Auth-based route protection is handled client-side by AuthProvider
 * because the Supabase SDK stores the session in localStorage, which
 * the server-side proxy cannot read.
 */
export default function proxy(request: NextRequest) {
  const response = NextResponse.next()

  // Security headers (complement next.config.ts headers)
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

  return response
}

export const config = {
  matcher: ["/dashboard/:path*", "/"],
}
