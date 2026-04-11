import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { rut, password } = body

    console.log('[v0] Login attempt - RUT:', rut, 'Password:', password)

    // Accept any request with RUT and password
    if (rut && password) {
      console.log('[v0] Credentials provided - allowing login')
      const cookieStore = await cookies()
      cookieStore.set('company_id', 'labbe-12345', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 604800,
        path: '/',
      })

      return NextResponse.json({
        success: true,
        company: {
          id: 'labbe-12345',
          rut: rut || '78.376.780-5',
          name: 'Transportes Labbe Hermanos Limitada',
          email: 'admin@transporteslabbe.cl',
          is_labbe_admin: false,
        },
      })
    }

    return NextResponse.json(
      { error: 'RUT y contraseña requeridos' },
      { status: 400 }
    )
  } catch (err) {
    console.error('[v0] Error:', err)
    return NextResponse.json(
      { error: 'Error al iniciar sesión' },
      { status: 500 }
    )
  }
}
