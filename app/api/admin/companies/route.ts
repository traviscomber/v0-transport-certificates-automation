import { createClient } from '@/lib/supabase/client'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const companyId = cookieStore.get('company_id')?.value
    const isLabbeAdmin = cookieStore.get('is_labbe_admin')?.value

    // Verificar que sea admin de Labbe
    if (isLabbeAdmin !== 'true') {
      return Response.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    // Obtener todas las empresas
    const supabase = createClient()
    const { data: companies, error } = await supabase
      .from('companies')
      .select('id, rut, name, representative, email, phone, region, is_labbe_admin')
      .order('name', { ascending: true })

    if (error) {
      throw error
    }

    console.log(`[v0] Admin fetched ${companies?.length || 0} companies`)

    return Response.json({
      success: true,
      companies: companies || [],
    })
  } catch (err) {
    console.error('[v0] Error fetching companies:', err)
    return Response.json(
      { error: err instanceof Error ? err.message : 'Error al obtener empresas' },
      { status: 500 }
    )
  }
}
