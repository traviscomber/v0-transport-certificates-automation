import { cookies } from 'next/headers'

export async function POST() {
  try {
    const cookieStore = await cookies()
    
    // Limpiar cookies de sesión
    cookieStore.delete('company_id')
    cookieStore.delete('company_rut')
    cookieStore.delete('is_labbe_admin')

    console.log('[v0] Logout successful')

    return Response.json({ success: true })
  } catch (err) {
    console.error('[v0] Logout error:', err)
    return Response.json(
      { error: 'Error al cerrar sesión' },
      { status: 500 }
    )
  }
}
