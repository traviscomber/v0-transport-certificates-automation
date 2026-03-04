import { createClient } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If environment variables are not set, pass through
  if (!url || !key) {
    if (process.env.NODE_ENV === 'development') {
      console.log("[v0] Supabase env vars not set in middleware")
    }
    return NextResponse.next({ request })
  }

  try {
    // Create a client just for this request
    const supabase = createClient(url, key)

    // Get the session from cookies
    const sessionCookie = request.cookies.get("sb-session")?.value
    if (!sessionCookie) {
      // No session, check if this is a protected route
      const pathname = request.nextUrl.pathname
      const publicPaths = [
        "/",
        "/auth/login",
        "/auth/register",
        "/setup-demo",
        "/_next",
        "/api",
      ]

      const isPublic = publicPaths.some((path) => pathname.startsWith(path)) || pathname.match(/\.(svg|png|jpg|jpeg|gif|webp)$/)

      if (!isPublic) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = "/auth/login"
        return NextResponse.redirect(redirectUrl)
      }
    }

    return NextResponse.next({ request })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.log("[v0] Middleware error:", error)
    }
    return NextResponse.next({ request })
  }
}
