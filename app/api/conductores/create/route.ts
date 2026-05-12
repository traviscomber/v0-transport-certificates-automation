import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { rut, nombres, apellido_paterno, apellido_materno, rut_proveedor, clase_licencia, is_active } = await request.json()

    // Validate required fields
    if (!rut || !nombres || !rut_proveedor) {
      return NextResponse.json(
        { error: 'RUT, nombres, y rut_proveedor son requeridos' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Check if conductor already exists
    const { data: existingConductor } = await supabase
      .from('conductores')
      .select('id')
      .eq('rut', rut)
      .single()

    if (existingConductor) {
      return NextResponse.json(
        { error: 'Ya existe un conductor con este RUT' },
        { status: 409 }
      )
    }

    // Insert new conductor
    const { data, error } = await supabase
      .from('conductores')
      .insert({
        rut,
        nombres,
        apellido_paterno: apellido_paterno || '',
        apellido_materno: apellido_materno || '',
        rut_proveedor,
        clase_licencia: clase_licencia || 'B',
        is_active: is_active !== false,
        created_at: new Date().toISOString(),
      })
      .select()

    if (error) {
      console.error('[v0] Error creating conductor:', error)
      throw error
    }

    console.log('[v0] New conductor created:', data)

    return NextResponse.json({
      success: true,
      conductor: data?.[0],
      message: 'Conductor creado exitosamente'
    })
  } catch (error) {
    console.error('[v0] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
