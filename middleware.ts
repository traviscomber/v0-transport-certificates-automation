import { updateSession } from "@/lib/supabase/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const uuidSegment = '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}'

const destructiveApiPatterns = [
  /^\/api\/admin\/clean-all-users$/,
  /^\/api\/admin\/cleanup-documents$/,
  /^\/api\/admin\/cleanup-profiles$/,
  /^\/api\/admin\/delete-dandus$/,
  /^\/api\/admin\/assign-company-exec$/,
  /^\/api\/admin\/migrate-conductores$/,
  /^\/api\/admin\/migrate-transportistas$/,
  /^\/api\/admin\/remove-cert-afiliaciones$/,
  /^\/api\/admin\/sync-drivers$/,
  /^\/api\/admin\/update-document-list$/,
  new RegExp(`^/api/admin/users/${uuidSegment}$`),
  new RegExp(`^/api/alerts-log/${uuidSegment}$`),
  new RegExp(`^/api/alerts/${uuidSegment}$`),
  new RegExp(`^/api/company/documents/${uuidSegment}$`),
  new RegExp(`^/api/company/documents/${uuidSegment}/delete$`),
  /^\/api\/company\/monthly-documents$/,
  new RegExp(`^/api/company/users/${uuidSegment}$`),
  new RegExp(`^/api/conductores/${uuidSegment}$`),
  new RegExp(`^/api/conductor/documents/${uuidSegment}$`),
  new RegExp(`^/api/documents/${uuidSegment}$`),
  /^\/api\/transportistas\/update-executive$/,
  new RegExp(`^/api/transportistas/${uuidSegment}$`),
]

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const method = request.method.toUpperCase()

  if (
    process.env.NODE_ENV === 'production' &&
    ['POST', 'DELETE'].includes(method) &&
    destructiveApiPatterns.some((pattern) => pattern.test(path))
  ) {
    return NextResponse.json(
      {
        error: 'Destructive API actions are disabled in production to protect live data.',
      },
      { status: 403 }
    )
  }

  // Skip auth and API auth routes entirely
  if (
    path.startsWith('/api/auth') ||
    path.startsWith('/auth/login') ||
    path === '/login' ||  // ✅ Allow /login page
    path === '/api/login-email' ||  // ✅ Allow login endpoint
    path === '/api/logout'
  ) {
    return NextResponse.next()
  }

  // Protect conductor routes — check httpOnly cookie set by the login endpoint
  if (path.startsWith('/conductor')) {
    const conductorId = request.cookies.get('conductor_id')?.value
    if (!conductorId) {
      return NextResponse.redirect(new URL('/auth/login-conductor', request.url))
    }
    return NextResponse.next()
  }

  // Protect admin routes - require authentication
  if (path.startsWith('/admin')) {
    const userEmail = request.cookies.get('user_email')?.value
    
    if (!userEmail) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // Only allow ejecutiva role to access admin routes
    const userRole = request.cookies.get('user_role')?.value
    if (userRole !== 'ejecutiva' && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    return NextResponse.next()
  }

  // Protect prevencionista routes - require authentication
  if (path.startsWith('/prevencionista')) {
    const userEmail = request.cookies.get('user_email')?.value
    
    if (!userEmail) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // /prevencionista (exact) redirects to /prevencionista/dashboard
    if (path === '/prevencionista' || path === '/prevencionista/') {
      return NextResponse.redirect(new URL('/prevencionista/dashboard', request.url))
    }
    
    return NextResponse.next()
  }

  // Protect dashboard routes - require authentication
  if (path.startsWith('/dashboard')) {
    const userEmail = request.cookies.get('user_email')?.value
    
    if (!userEmail) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // /dashboard (exact) always redirects to /dashboard/company
    if (path === '/dashboard' || path === '/dashboard/') {
      return NextResponse.redirect(new URL('/dashboard/company', request.url))
    }
    
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

