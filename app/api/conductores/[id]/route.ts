import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id,
      rut,
      nombres,
      apellido_paterno,
      apellido_materno,
      transportista_id,
      rut_proveedor,
      clase_licencia,
      is_active,
      fecha_nacimiento,
      direccion,
      comuna,
      ciudad,
      telefono,
      email,
      numero_licencia,
      vencimiento_licencia,
      es_pensionado,
      numero_afp,
      numero_isapre,
      tipo_contratacion,
      numero_pension,
      institucion_pension,
    } = body

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
        ...(transportista_id && { transportista_id }),
        ...(rut_proveedor && { rut_proveedor }),
        ...(clase_licencia && { clase_licencia }),
        ...(is_active !== undefined && { is_active }),
        ...(fecha_nacimiento !== undefined && { fecha_nacimiento: fecha_nacimiento || null }),
        ...(direccion !== undefined && { direccion: direccion || null }),
        ...(comuna !== undefined && { comuna: comuna || null }),
        ...(ciudad !== undefined && { ciudad: ciudad || null }),
        ...(telefono !== undefined && { telefono: telefono || null }),
        ...(email !== undefined && { email: email || null }),
        ...(numero_licencia !== undefined && { numero_licencia: numero_licencia || null }),
        ...(vencimiento_licencia !== undefined && { vencimiento_licencia: vencimiento_licencia || null }),
        ...(es_pensionado !== undefined && { es_pensionado }),
        ...(numero_afp !== undefined && { numero_afp: numero_afp || null }),
        ...(numero_isapre !== undefined && { numero_isapre: numero_isapre || null }),
        ...(tipo_contratacion !== undefined && { tipo_contratacion: tipo_contratacion || null }),
        ...(numero_pension !== undefined && { numero_pension: numero_pension || null }),
        ...(institucion_pension !== undefined && { institucion_pension: institucion_pension || null }),
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
