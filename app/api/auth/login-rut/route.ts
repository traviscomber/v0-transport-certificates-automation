import { loginByRUT } from '@/lib/supabase/auth-rut'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { rut, password } = await request.json()

    if (!rut || !password) {
      return Response.json(
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

    cookieStore.set('is_labbe_admin', String(company.is_labbe_admin), {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    console.log(`[v0] Login successful for company: ${company.rut}`)

    return Response.json({
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

    return Response.json(
      { error: errorMessage },
      { status: 401 }
    )
  }
}
