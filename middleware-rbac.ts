import { updateSession } from "@/lib/supabase/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Rutas públicas que no requieren autenticación
const PUBLIC_ROUTES = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/api/health',
  '/api/docs',
]

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Skip API routes and static files
  if (path.startsWith('/api') || path.startsWith('/_next') || path.includes('.')) {
    return await updateSession(request)
  }

  // Public routes - no auth needed
  if (PUBLIC_ROUTES.includes(path)) {
    return await updateSession(request)
  }

  // Para rutas protegidas, mantener la sesión actualizada
  return await updateSession(request)
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
