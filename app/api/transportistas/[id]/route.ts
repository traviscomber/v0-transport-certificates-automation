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

    console.log('[v0] PATCH transportistas - ID:', id)
    console.log('[v0] PATCH transportistas - Body:', JSON.stringify(body))

    const supabase = createAdminClient()

    // Build update object with all fields that now exist in transportistas table
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    // Add fields only if they are provided in the body and defined
    if (body.razon_social !== undefined) updateData.razon_social = body.razon_social
    if (body.nombre !== undefined) updateData.nombre = body.nombre || null
    if (body.rut !== undefined) updateData.rut = body.rut
    if (body.region !== undefined) updateData.region = body.region || null
    if (body.comuna !== undefined) updateData.comuna = body.comuna || null
    if (body.telefono !== undefined) updateData.telefono = body.telefono || null
    if (body.email !== undefined) updateData.email = body.email || null
    if (body.nombre_contacto !== undefined) updateData.nombre_contacto = body.nombre_contacto || null
    if (body.representante_legal !== undefined) updateData.representante_legal = body.representante_legal || null
    if (body.direccion !== undefined) updateData.direccion = body.direccion || null
    if (body.is_active !== undefined) updateData.is_active = body.is_active
    
    // Handle assigned executive - allow null/empty to clear assignment
    if (body.assigned_executive_id !== undefined) {
      updateData.assigned_executive_id = body.assigned_executive_id || null
    }

    // Validate that at least razon_social is provided
    if (!updateData.razon_social) {
      return NextResponse.json({ error: 'razon_social is required' }, { status: 400 })
    }

    console.log('[v0] PATCH transportistas - UpdateData:', JSON.stringify(updateData))

    const { data, error } = await supabase
      .from('transportistas')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) {
      console.error('[v0] PATCH transportistas - Supabase Error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      throw new Error(`Database error: ${error.message}`)
    }

    console.log('[v0] PATCH transportistas - Success:', data?.[0]?.id)

    return NextResponse.json({
      success: true,
      transportista: data?.[0],
      message: 'Subcontratista actualizado exitosamente'
    }, { status: 200 })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('[v0] PATCH transportistas - Exception:', errorMsg, error)
    
    return NextResponse.json(
      { 
        error: errorMsg,
        success: false
      },
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

    return NextResponse.json({
      success: true,
      message: 'Subcontratista eliminado exitosamente'
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error deleting transportista' },
      { status: 500 }
    )
  }
}
