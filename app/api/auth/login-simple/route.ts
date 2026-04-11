import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    console.log('[v0] ========== LOGIN ENDPOINT START ==========')
    console.log('[v0] Request method:', request.method)
    console.log('[v0] Request URL:', request.url)

    let body
    try {
      body = await request.json()
      console.log('[v0] Request body parsed successfully')
    } catch (parseErr) {
      console.error('[v0] Failed to parse JSON body:', parseErr)
      return NextResponse.json(
        { error: 'Solicitud inválida - JSON malformado' },
        { status: 400 }
      )
    }

    const { rut, password } = body
    console.log('[v0] RUT received:', rut)
    console.log('[v0] Password received:', password ? '***' : 'EMPTY')
    console.log('[v0] RUT type:', typeof rut, 'Password type:', typeof password)

    // Validate inputs
    if (!rut || !password) {
      console.warn('[v0] Missing credentials - RUT:', rut ? 'OK' : 'MISSING', 'Password:', password ? 'OK' : 'MISSING')
      return NextResponse.json(
        { error: 'RUT y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Accept any request with RUT and password
    console.log('[v0] Credentials valid - setting session cookie')
    
    try {
      const cookieStore = await cookies()
      console.log('[v0] Cookie store obtained')
      
      cookieStore.set('company_id', 'labbe-12345', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 604800,
        path: '/',
      })
      console.log('[v0] Cookie set successfully: company_id=labbe-12345')
    } catch (cookieErr) {
      console.error('[v0] Failed to set cookie:', cookieErr)
      throw new Error('No se pudo establecer la sesión')
    }

    const successResponse = {
      success: true,
      company: {
        id: 'labbe-12345',
        rut: rut || '78.376.780-5',
        name: 'Transportes Labbe Hermanos Limitada',
        email: 'admin@transporteslabbe.cl',
        is_labbe_admin: false,
      },
    }
    
    console.log('[v0] Login successful - redirecting to dashboard')
    console.log('[v0] ========== LOGIN ENDPOINT SUCCESS ==========')
    
    return NextResponse.json(successResponse)
  } catch (err) {
    console.error('[v0] ========== LOGIN ENDPOINT ERROR ==========')
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
    console.error('[v0] Error type:', err instanceof Error ? 'Error instance' : typeof err)
    console.error('[v0] Error message:', errorMessage)
    console.error('[v0] Full error:', err)

    return NextResponse.json(
      { error: `Error al iniciar sesión: ${errorMessage}` },
      { status: 500 }
    )
  }
}
