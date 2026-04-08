import { createClient } from '@/lib/supabase/client'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const companyId = cookieStore.get('company_id')?.value

    if (!companyId) {
      return Response.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Obtener perfil de la empresa
    const supabase = createClient()
    const { data: profile, error } = await supabase
      .from('companies')
      .select('id, rut, name, representative, email, phone, address, region')
      .eq('id', companyId)
      .single()

    if (error || !profile) {
      throw new Error('Perfil no encontrado')
    }

    console.log(`[v0] Company profile loaded: ${profile.rut}`)

    return Response.json({
      success: true,
      profile,
    })
  } catch (err) {
    console.error('[v0] Error fetching profile:', err)
    return Response.json(
      { error: err instanceof Error ? err.message : 'Error al obtener perfil' },
      { status: 500 }
    )
  }
}
