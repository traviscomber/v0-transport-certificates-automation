import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, rut, nombres, apellido_paterno, apellido_materno, rut_proveedor, clase_licencia, is_active } = body

    if (!id || !rut) {
      return NextResponse.json(
        { error: 'ID y RUT son requeridos' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Update conductor
    const { data, error } = await supabase
      .from('conductores')
      .update({
        ...(rut && { rut }),
        ...(nombres && { nombres }),
        ...(apellido_paterno !== undefined && { apellido_paterno }),
        ...(apellido_materno !== undefined && { apellido_materno }),
        ...(rut_proveedor && { rut_proveedor }),
        ...(clase_licencia && { clase_licencia }),
        ...(is_active !== undefined && { is_active }),
      })
      .eq('id', id)
      .select()

    if (error) {
      console.error('[v0] Error updating conductor:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    console.log('[v0] Conductor updated:', data?.[0])

    return NextResponse.json({
      success: true,
      conductor: data?.[0],
      message: 'Conductor actualizado exitosamente'
    })
  } catch (error) {
    console.error('[v0] Error in PATCH:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID es requerido' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // First, get the conductor to delete related data
    const { data: conductor, error: fetchError } = await supabase
      .from('conductores')
      .select('rut')
      .eq('id', id)
      .single()

    if (fetchError) {
      return NextResponse.json(
        { error: 'Conductor no encontrado' },
        { status: 404 }
      )
    }

    // Delete conductor auth records
    const { error: authError } = await supabase
      .from('conductor_auth')
      .delete()
      .eq('conductor_id', id)

    if (authError) {
      console.warn('[v0] Warning deleting conductor_auth:', authError)
    }

    // Delete conductor licenses
    const { error: licenseError } = await supabase
      .from('conductor_licenses')
      .delete()
      .eq('conductor_id', id)

    if (licenseError) {
      console.warn('[v0] Warning deleting conductor_licenses:', licenseError)
    }

    // Delete conductor
    const { error: deleteError } = await supabase
      .from('conductores')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('[v0] Error deleting conductor:', deleteError)
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      )
    }

    console.log('[v0] Conductor deleted:', conductor?.rut)

    return NextResponse.json({
      success: true,
      message: 'Conductor eliminado exitosamente'
    })
  } catch (error) {
    console.error('[v0] Error in DELETE:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}
