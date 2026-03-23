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
    const pathname = request.nextUrl.pathname

    // Define public and protected paths
    const publicPaths = [
      "/",
      "/auth/login",
      "/auth/register",
      "/setup-demo",
      "/login",
      "/_next",
      "/api",
    ]

    const isPublic = publicPaths.some((path) => pathname.startsWith(path)) || pathname.match(/\.(svg|png|jpg|jpeg|gif|webp)$/)

    if (!sessionCookie) {
      // No session, check if this is a protected route
      if (!isPublic) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = "/auth/login"
        return NextResponse.redirect(redirectUrl)
      }
      return NextResponse.next({ request })
    }

    // Session exists, now check role-based access
    // Parse the session to get user role if available
    const response = NextResponse.next({ request })
    
    // Role-based route protection
    const roleBasedRoutes: Record<string, string[]> = {
      '/admin': ['admin'],
      '/admin/': ['admin'],
      '/mandante': ['mandante', 'admin'],
      '/mandante/': ['mandante', 'admin'],
      '/transportista': ['transportista', 'admin'],
      '/transportista/': ['transportista', 'admin'],
      '/conductor': ['conductor', 'admin'],
      '/conductor/': ['conductor', 'admin'],
      '/walmart-ocr': ['admin', 'mandante', 'transportista', 'conductor'],
      '/walmart-ocr/': ['admin', 'mandante', 'transportista', 'conductor'],
    }

    // Check if route requires role-based access
    for (const [routePath, allowedRoles] of Object.entries(roleBasedRoutes)) {
      if (pathname.startsWith(routePath)) {
        // In production, you would validate the user's role from their session/JWT
        // For now, we allow the request through and client-side will handle access control
        // via the RoleGuard component
        if (process.env.NODE_ENV === 'development') {
          console.log(`[v0] Route protection: ${pathname} requires roles: ${allowedRoles.join(', ')}`)
        }
        break
      }
    }

    return response
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.log("[v0] Middleware error:", error)
    }
    return NextResponse.next({ request })
  }
}
