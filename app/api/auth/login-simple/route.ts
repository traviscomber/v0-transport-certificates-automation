import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { rut, password } = body

    console.log('[v0] Login attempt received')
    console.log('[v0] RUT:', rut)
    console.log('[v0] Password received:', password)
    console.log('[v0] Password type:', typeof password)
    console.log('[v0] Password length:', password?.length)
    console.log('[v0] Expected password: labbe2024')
    console.log('[v0] Match result:', password === 'labbe2024')

    // Hardcoded credentials
    if (password === 'labbe2024') {
      console.log('[v0] PASSWORD MATCH - Setting cookies')
      const cookieStore = await cookies()
      cookieStore.set('company_id', 'labbe-12345', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 604800,
        path: '/',
      })

      console.log('[v0] Cookie set - Returning success')

      return NextResponse.json({
        success: true,
        company: {
          id: 'labbe-12345',
          rut: '78.376.780-5',
          name: 'Transportes Labbe Hermanos Limitada',
          email: 'admin@transporteslabbe.cl',
          is_labbe_admin: false,
        },
      })
    }

    console.log('[v0] PASSWORD MISMATCH - Returning 401')
    return NextResponse.json(
      { error: 'Contraseña incorrecta' },
      { status: 401 }
    )
  } catch (err) {
    console.error('[v0] Error in login endpoint:', err)
    return NextResponse.json(
      { error: 'Error' },
      { status: 500 }
    )
  }
}
