import { NextRequest, NextResponse } from 'next/server'
import { loginConductor } from '@/lib/supabase/auth-conductor'

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 30 * 24 * 60 * 60,
  path: '/',
}

export async function POST(request: NextRequest) {
  try {
    const { rut, password } = await request.json()

    if (!rut || !password) {
      return NextResponse.json(
        { error: 'RUT y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Authenticate conductor
    const conductor = await loginConductor(rut, password)
    console.log('[v0] Login successful for RUT:', rut)
    console.log('[v0] Conductor data:', {
      id: conductor.id,
      rut: conductor.rut,
      nombre_completo: conductor.nombre_completo,
      email: conductor.email,
    })

    // Build response first, then set cookies on the response object
    // NOTE: In Next.js 15 Route Handlers, cookies() from next/headers is read-only.
    // The only way to write cookies is via NextResponse.cookies.set().
    const responseData = {
      success: true,
      conductor_id: conductor.id,
      rut: conductor.rut,
      nombre_completo: conductor.nombre_completo,
      email: conductor.email,
      transportista_id: conductor.transportista_id,
    }
    
    console.log('[v0] Sending response:', responseData)
    
    const response = NextResponse.json(responseData)

    response.cookies.set('conductor_id', conductor.id, COOKIE_OPTIONS)
    response.cookies.set('conductor_rut', conductor.rut, COOKIE_OPTIONS)
    response.cookies.set('conductor_nombre', conductor.nombre_completo, COOKIE_OPTIONS)
    response.cookies.set('user_email', conductor.email, COOKIE_OPTIONS)

    return response
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error al iniciar sesión'
    console.error('[v0] Conductor login error:', errorMessage)

    return NextResponse.json(
      { error: errorMessage },
      { status: 401 }
    )
  }
}
