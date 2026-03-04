import { createClient } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If environment variables are not set, just pass through
  if (!url || !key) {
    return NextResponse.next({ request })
  }

  try {
    const supabase = createClient(url, key)

    // Get the session from cookies
    const sessionCookie = request.cookies.get("sb-session")?.value
    if (!sessionCookie) {
      // No session, check if this is a protected route
      const pathname = request.nextUrl.pathname
      if (
        pathname !== "/" &&
        !pathname.startsWith("/auth") &&
        !pathname.startsWith("/setup-demo") &&
        !pathname.startsWith("/_next") &&
        !pathname.startsWith("/api") &&
        !pathname.match(/\.(svg|png|jpg|jpeg|gif|webp)$/)
      ) {
        const url = request.nextUrl.clone()
        url.pathname = "/auth/login"
        return NextResponse.redirect(url)
      }
    }

    return NextResponse.next({ request })
  } catch (error) {
    // If there's an error creating the client, just pass through
    return NextResponse.next({ request })
  }
}
