import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { rut, password } = body

    // Hardcoded credentials
    if (password === 'labbe2024') {
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
          rut: '78.376.780-5',
          name: 'Transportes Labbe Hermanos Limitada',
          email: 'admin@transporteslabbe.cl',
          is_labbe_admin: false,
        },
      })
    }

    return NextResponse.json(
      { error: 'Contraseña incorrecta' },
      { status: 401 }
    )
  } catch (err) {
    return NextResponse.json(
      { error: 'Error' },
      { status: 500 }
    )
  }
}
