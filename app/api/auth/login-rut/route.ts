export const dynamic = 'force-dynamic'

import { loginByRUT } from '@/lib/supabase/auth-rut'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { rut, password } = body

    if (!rut || !password) {
      return NextResponse.json(
        { error: 'RUT y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Autenticar por RUT
    const company = await loginByRUT(rut, password)

    // Guardar sesión en cookies (HTTP-only)
    const cookieStore = await cookies()
    cookieStore.set('company_id', company.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: '/',
    })

    cookieStore.set('company_rut', company.rut, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    console.log(`[v0] Login successful for company: ${company.rut}`)

    return NextResponse.json({
      success: true,
      company: {
        id: company.id,
        rut: company.rut,
        name: company.name,
        email: company.email,
        is_labbe_admin: company.is_labbe_admin,
      },
    })
  } catch (err) {
    console.error('[v0] Login error:', err)
    const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión'

    return NextResponse.json(
      { error: errorMessage },
      { status: 401 }
    )
  }
}
