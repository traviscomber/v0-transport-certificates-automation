import { updateSession } from "@/lib/supabase/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Rutas públicas que no requieren autenticación
const PUBLIC_ROUTES = [
  '/',
  '/auth/login',
  '/auth/login-company',
  '/auth/register',
  '/auth/forgot-password',
  '/test',
  '/setup-demo',
  '/contact',
  '/api/health',
  '/api/docs',
  '/api/auth/login-rut',
]

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Skip API routes and static files
  if (path.startsWith('/_next') || path.includes('.')) {
    return await updateSession(request)
  }

  // Proteger rutas del dashboard
  if (path.startsWith('/dashboard')) {
    const companyId = request.cookies.get('company_id')?.value

    if (!companyId) {
      // Redirigir a login si no está autenticado
      return NextResponse.redirect(new URL('/auth/login-company', request.url))
    }

    return await updateSession(request)
  }

  // Redirect old walmart-ocr routes to new /ocr routes
  if (path.startsWith('/walmart-ocr')) {
    const newPath = path.replace('/walmart-ocr', '/ocr')
    return NextResponse.redirect(new URL(newPath, request.url), { status: 308 })
  }

  // Public routes - no auth needed
  if (PUBLIC_ROUTES.includes(path)) {
    return await updateSession(request)
  }

  // Para rutas protegidas de API, validar que tenga sesión
  if (path.startsWith('/api')) {
    const companyId = request.cookies.get('company_id')?.value

    // Permitir endpoints públicos de API
    const publicApiEndpoints = ['/api/auth', '/api/health', '/api/docs']
    const isPublicApi = publicApiEndpoints.some(endpoint => path.startsWith(endpoint))

    if (!isPublicApi && !companyId) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }
  }

  // For other routes, just update the session
  return await updateSession(request)
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

