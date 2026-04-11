import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/client'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const executiveId = cookieStore.get('company_id')?.value

    if (!executiveId) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const supabase = createClient()

    // Obtener datos del ejecutivo
    const { data: executive, error: execError } = await supabase
      .from('executive_staff')
      .select('id, rut, full_name, email, cargo, transportista_id')
      .eq('id', executiveId)
      .single()

    if (execError || !executive) {
      throw new Error('Ejecutivo no encontrado')
    }

    // Obtener datos de la empresa
    const { data: company, error: compError } = await supabase
      .from('transportistas')
      .select('id, rut, razon_social, email, telefono, direccion, region')
      .eq('id', executive.transportista_id)
      .single()

    if (compError || !company) {
      throw new Error('Empresa no encontrada')
    }

    return NextResponse.json({
      executive: {
        id: executive.id,
        rut: executive.rut,
        full_name: executive.full_name,
        email: executive.email,
        cargo: executive.cargo,
      },
      company: {
        id: company.id,
        rut: company.rut,
        razon_social: company.razon_social,
        email: company.email,
        telefono: company.telefono,
        direccion: company.direccion,
        region: company.region,
      },
    })
  } catch (err) {
    console.error('[v0] Dashboard data error:', err)
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido'

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
