import { changeCompanyPassword } from '@/lib/supabase/auth-rut'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const companyId = cookieStore.get('company_id')?.value

    if (!companyId) {
      return Response.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const { oldPassword, newPassword, confirmPassword } = await request.json()

    if (!oldPassword || !newPassword) {
      return Response.json(
        { error: 'Contraseña actual y nueva son requeridas' },
        { status: 400 }
      )
    }

    if (newPassword !== confirmPassword) {
      return Response.json(
        { error: 'Las contraseñas no coinciden' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return Response.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      )
    }

    // Cambiar contraseña
    await changeCompanyPassword(companyId, oldPassword, newPassword)

    console.log(`[v0] Password changed for company: ${companyId}`)

    return Response.json({
      success: true,
      message: 'Contraseña actualizada correctamente',
    })
  } catch (err) {
    console.error('[v0] Change password error:', err)
    const errorMessage = err instanceof Error ? err.message : 'Error al cambiar contraseña'

    return Response.json(
      { error: errorMessage },
      { status: 400 }
    )
  }
}
