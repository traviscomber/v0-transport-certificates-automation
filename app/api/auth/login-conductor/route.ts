import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { loginConductor } from '@/lib/supabase/auth-conductor'

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

    // Set cookies
    const cookieStore = await cookies()
    cookieStore.set('conductor_id', conductor.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    })
    cookieStore.set('conductor_rut', conductor.rut, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
    })

    return NextResponse.json({
      success: true,
      conductor_id: conductor.id,
      rut: conductor.rut,
      nombre_completo: conductor.nombre_completo,
      email: conductor.email,
      transportista_id: conductor.transportista_id,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error al iniciar sesión'
    console.error('[v0] Conductor login error:', errorMessage)
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 401 }
    )
  }
}
