export const dynamic = 'force-dynamic'

import { loginByRUT } from '@/lib/supabase/auth-rut'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    console.log('[v0] ============ LOGIN-RUT ENDPOINT START ============')
    console.log('[v0] Login-RUT endpoint called')
    
    let body
    try {
      body = await request.json()
    } catch (parseErr) {
      console.error('[v0] Failed to parse request body:', parseErr)
      return NextResponse.json(
        { error: 'Solicitud inválida' },
        { status: 400 }
      )
    }

    console.log('[v0] Request body received:', { rut: body?.rut, hasPassword: !!body?.password })
    const { rut, password } = body || {}

    if (!rut || !password) {
      console.log('[v0] Missing RUT or password')
      return NextResponse.json(
        { error: 'RUT y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Autenticar por RUT
    console.log('[v0] Calling loginByRUT with RUT:', rut)
    let company
    try {
      company = await loginByRUT(rut, password)
    } catch (authErr) {
      console.error('[v0] Authentication failed:', authErr)
      return NextResponse.json(
        { error: authErr instanceof Error ? authErr.message : 'Autenticación fallida' },
        { status: 401 }
      )
    }

    console.log('[v0] LoginByRUT successful, company:', company?.name)

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
    console.log('[v0] ============ LOGIN-RUT ENDPOINT SUCCESS ============')

    const responseData = {
      success: true,
      company: {
        id: company.id,
        rut: company.rut,
        name: company.name,
        email: company.email,
        is_labbe_admin: company.is_labbe_admin,
      },
    }

    return NextResponse.json(responseData)
  } catch (err) {
    console.error('[v0] ============ LOGIN-RUT ENDPOINT ERROR ============')
    console.error('[v0] Login error:', err)
    const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión'
    console.error('[v0] Error details:', errorMessage)

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
