import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { rut, password } = body

    console.log('[v0-simple] Received login attempt with RUT:', rut)

    // Simple hardcoded validation - RUT de Labbe
    const VALID_RUT = '78.376.780-5'
    const VALID_PASSWORD = 'labbe2024'

    // Normalize RUT for comparison (remove dots)
    const normalizedInput = rut.replace(/\./g, '').replace(/\s/g, '').trim()
    const normalizedValid = VALID_RUT.replace(/\./g, '').replace(/\s/g, '').trim()

    console.log('[v0-simple] Normalized input RUT:', normalizedInput)
    console.log('[v0-simple] Expected RUT:', normalizedValid)
    console.log('[v0-simple] Password match:', password === VALID_PASSWORD)

    // Validate RUT and password
    if (normalizedInput !== normalizedValid || password !== VALID_PASSWORD) {
      console.log('[v0-simple] Login failed - invalid credentials')
      return NextResponse.json(
        { error: 'RUT o contraseña incorrectos' },
        { status: 401 }
      )
    }

    // Success - set cookies
    const cookieStore = await cookies()
    cookieStore.set('company_id', 'labbe-main-12345', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    console.log('[v0-simple] Login successful')

    return NextResponse.json({
      success: true,
      company: {
        id: 'labbe-main-12345',
        rut: VALID_RUT,
        name: 'Transportes Labbe Hermanos Limitada',
        email: 'admin@transporteslabbe.cl',
        is_labbe_admin: false,
      },
    })
  } catch (err) {
    console.error('[v0-simple] Error:', err)
    return NextResponse.json(
      { error: 'Error al iniciar sesión' },
      { status: 500 }
    )
  }
}
