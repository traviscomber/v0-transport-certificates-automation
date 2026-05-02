import { updateSession } from "@/lib/supabase/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Skip middleware for auth/login routes and API login routes
  if (path.startsWith('/api/auth/login') || path.startsWith('/auth/login') || path === '/api/logout') {
    return NextResponse.next()
  }

  // Protect conductor routes - require conductor_id cookie
  if (path.startsWith('/conductor')) {
    const conductorId = request.cookies.get('conductor_id')?.value
    
    if (!conductorId) {
      console.log('[v0] Middleware: Redirecting to login - no conductor_id cookie for path:', path)
      // Return a redirect response that allows the client's router.push to take precedence
      return NextResponse.redirect(new URL('/auth/login-conductor', request.url))
    }
    
    console.log('[v0] Middleware: Conductor authorized for path:', path)
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

