import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Logout exitoso',
    })

    // Clear the token cookie
    response.cookies.set({
      name: 'transportista_token',
      value: '',
      httpOnly: true,
      maxAge: 0,
      path: '/',
    })

    return response

  } catch (error) {
    console.error('[v0] Error in logout:', error)
    return NextResponse.json(
      { error: 'Error al cerrar sesión' },
      { status: 500 }
    )
  }
}
