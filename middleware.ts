import { updateSession } from "@/lib/supabase/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Skip middleware for auth routes, API login routes, and conductor portal
  // Conductor auth is handled by the RSC layout via cookies() from next/headers
  if (
    path.startsWith('/api/auth') ||
    path.startsWith('/auth/login') ||
    path.startsWith('/conductor') ||
    path === '/api/logout'
  ) {
    return NextResponse.next()
  }

  // Protect dashboard routes - require authentication
  if (path.startsWith('/dashboard')) {
    const userEmail = request.cookies.get('user_email')?.value
    
    if (!userEmail) {
      console.log('[v0] Middleware: Redirecting to login - no user_email cookie for path:', path)
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    console.log('[v0] Middleware: User authorized for path:', path)
    return NextResponse.next()
  }

  // Skip API routes (except dashboard data which might need auth)
  if (path.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Skip static files and assets
  if (path.includes('.')) {
    return NextResponse.next()
  }

  // Redirect old walmart-ocr routes to new /ocr routes
  if (path.startsWith('/walmart-ocr')) {
    const newPath = path.replace('/walmart-ocr', '/ocr')
    return NextResponse.redirect(new URL(newPath, request.url), { status: 308 })
  }

  // For other routes, just update the session
  return await updateSession(request)
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

