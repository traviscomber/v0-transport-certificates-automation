import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('transportistas')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ success: true, transportista: data })
  } catch (error) {
    console.error('[v0] Error fetching transportista:', error)
    return NextResponse.json({ error: 'Error fetching transportista' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    const supabase = createAdminClient()

    // Validate required fields
    if (!body.razon_social) {
      return NextResponse.json({ error: 'razon_social is required' }, { status: 400 })
    }

    // Build update object with only provided fields
    const updateData: any = {
      razon_social: body.razon_social,
      rut: body.rut,
      is_active: body.is_active ?? true,
      updated_at: new Date().toISOString(),
    }

    // Add optional fields if provided
    if (body.region) updateData.region = body.region
    if (body.comuna) updateData.comuna = body.comuna
    if (body.telefono) updateData.telefono = body.telefono
    if (body.email) updateData.email = body.email
    if (body.nombre_contacto !== undefined) updateData.nombre_contacto = body.nombre_contacto

    const { data, error } = await supabase
      .from('transportistas')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) {
      console.error('[v0] Error updating transportista:', error)
      throw error
    }

    console.log('[v0] Transportista updated:', data?.[0])

    return NextResponse.json({
      success: true,
      transportista: data?.[0],
      message: 'Subcontratista actualizado exitosamente'
    })
  } catch (error) {
    console.error('[v0] Error updating transportista:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error updating transportista' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const supabase = createAdminClient()

    // Check if transportista has active conductores
    const { data: conductores } = await supabase
      .from('conductores')
      .select('id', { count: 'exact' })
      .eq('rut_proveedor', id)

    if (conductores && conductores.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un subcontratista que tiene conductores asociados' },
        { status: 400 }
      )
    }

    // Delete transportista
    const { error } = await supabase
      .from('transportistas')
      .delete()
      .eq('id', id)

    if (error) throw error

    console.log('[v0] Transportista deleted:', id)

    return NextResponse.json({
      success: true,
      message: 'Subcontratista eliminado exitosamente'
    })
  } catch (error) {
    console.error('[v0] Error deleting transportista:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error deleting transportista' },
      { status: 500 }
    )
  }
}
