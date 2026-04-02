import { updateSession } from "@/lib/supabase/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Rutas públicas que no requieren autenticación
const PUBLIC_ROUTES = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/test',
  '/setup-demo',
  '/api/health',
  '/api/docs',
]

// Rutas por rol - qué roles pueden acceder dónde
const ROLE_ROUTES: Record<string, string[]> = {
  admin: ['/admin', '/dashboard', '/organizations', '/reports', '/compliance', '/certificates', '/alerts', '/drivers-management', '/vehicles-management', '/upload', '/profile'],
  dispatcher: ['/dispatcher', '/dashboard', '/alerts', '/drivers-management', '/vehicles-management', '/reports', '/upload', '/profile'],
  transportista: ['/transportista', '/dashboard', '/vehicles-management', '/drivers-management', '/documents', '/reports', '/upload', '/profile'],
  driver: ['/driver', '/dashboard', '/documents', '/profile'],
  mandante: ['/mandante', '/dashboard', '/reports', '/compliance', '/certificates', '/alerts', '/profile'],
}

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
  const requestResponse = await updateSession(request)
  
  // Verificar autenticación y permisos
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      // No autenticado - redirigir a login
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Obtener rol del usuario
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profileError || !profile) {
      console.error('[v0] Error fetching user profile:', profileError)
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    const userRole = profile.role as string

    // Verificar si el usuario tiene permiso para esta ruta
    const allowedRoutes = ROLE_ROUTES[userRole] || []
    const hasPermission = allowedRoutes.some(route => {
      if (route === path) return true
      if (path.startsWith(route + '/')) return true
      return false
    })

    if (!hasPermission) {
      // No tiene permiso - retornar 403
      console.warn(`[v0] User ${session.user.id} with role ${userRole} attempted unauthorized access to ${path}`)
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return requestResponse
  } catch (error) {
    console.error('[v0] Middleware RBAC error:', error)
    return requestResponse
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

