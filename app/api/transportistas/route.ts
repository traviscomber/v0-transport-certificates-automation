import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { razon_social, rut, region, comuna, telefono, email, nombre_contacto, is_active } = body

    // Validate required fields
    if (!razon_social || !rut) {
      return NextResponse.json(
        { error: 'razon_social y rut son requeridos' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Check if RUT already exists
    const { data: existing, error: checkError } = await supabase
      .from('transportistas')
      .select('id')
      .eq('rut', rut)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe un subcontratista con este RUT' },
        { status: 400 }
      )
    }

    // Create new transportista with only valid columns
    const { data, error } = await supabase
      .from('transportistas')
      .insert({
        razon_social,
        rut,
        region: region || null,
        comuna: comuna || null,
        telefono: telefono || null,
        email: email || null,
        representante_legal: nombre_contacto || null,
        is_active: is_active !== false,
      })
      .select()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      transportista: data?.[0],
      message: 'Subcontratista creado exitosamente'
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error creating transportista' },
      { status: 500 }
    )
  }
}
