export const dynamic = 'force-dynamic'

import { loginByRUT } from '@/lib/supabase/auth-rut'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    console.log('[v0] ============ LOGIN-RUT ENDPOINT START ============')
    console.log('[v0] Login-RUT endpoint called')
    
    const body = await request.json()
    console.log('[v0] Request body received:', { rut: body.rut, hasPassword: !!body.password })
    const { rut, password } = body

    if (!rut || !password) {
      console.log('[v0] Missing RUT or password')
      return NextResponse.json(
        { error: 'RUT y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Autenticar por RUT
    console.log('[v0] Calling loginByRUT with RUT:', rut)
    const company = await loginByRUT(rut, password)
    console.log('[v0] LoginByRUT successful, company:', company.name)

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
    console.error('[v0] ============ LOGIN-RUT ENDPOINT ERROR ============')
    console.error('[v0] Login error:', err)
    const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión'
    console.error('[v0] Error details:', errorMessage)
    console.error('[v0] Full error:', JSON.stringify(err, null, 2))

    return NextResponse.json(
      { error: errorMessage },
      { status: 401 }
    )
  }
}

    // Autenticar por RUT
    console.log('[v0] Calling loginByRUT with RUT:', rut)
    const company = await loginByRUT(rut, password)
    console.log('[v0] LoginByRUT successful, company:', company.name)

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
    console.error('[v0] Error details:', errorMessage)

    return NextResponse.json(
      { error: errorMessage },
      { status: 401 }
    )
  }
}
