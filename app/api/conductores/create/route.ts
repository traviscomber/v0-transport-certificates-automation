import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { hashPassword } from '@/lib/supabase/auth-conductor'

/**
 * Generates a legacy initial password for a new conductor.
 * Do not expose this formula in public UI or logs.
 */
function generateConductorPassword(rut: string): string {
  // Extract only numbers from RUT
  const rutNumbers = rut.replace(/[^0-9K]/g, '')
  // Get last 4 digits before the verification digit (positions -5 to -1)
  const last4Digits = rutNumbers.slice(-5, -1)
  return `labbe${last4Digits}`
}

export async function POST(request: NextRequest) {
  try {
    const {
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
    } = await request.json()

    // Validate required fields
    const supabase = createAdminClient()
    const resolvedTransportistaId = transportista_id || null
    let resolvedRutProveedor = rut_proveedor || null

    if (!resolvedRutProveedor && resolvedTransportistaId) {
      const { data: transportista } = await supabase
        .from('transportistas')
        .select('rut')
        .eq('id', resolvedTransportistaId)
        .single()

      resolvedRutProveedor = transportista?.rut || null
    }

    if (!rut || !nombres || (!resolvedTransportistaId && !resolvedRutProveedor)) {
      return NextResponse.json(
        { error: 'RUT, nombres, y transportista_id o rut_proveedor son requeridos' },
        { status: 400 }
      )
    }

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
        transportista_id: resolvedTransportistaId,
        rut_proveedor: resolvedRutProveedor,
        clase_licencia: clase_licencia || 'B',
        is_active: is_active !== false,
        fecha_nacimiento: fecha_nacimiento || null,
        direccion: direccion || null,
        comuna: comuna || null,
        ciudad: ciudad || null,
        telefono: telefono || null,
        email: email || null,
        numero_licencia: numero_licencia || null,
        vencimiento_licencia: vencimiento_licencia || null,
        es_pensionado: es_pensionado ?? null,
        numero_afp: numero_afp || null,
        numero_isapre: numero_isapre || null,
        tipo_contratacion: tipo_contratacion || null,
        numero_pension: numero_pension || null,
        institucion_pension: institucion_pension || null,
        created_at: new Date().toISOString(),
      })
      .select()

    if (error) {
      console.error('[v0] Error creating conductor:', error)
      throw error
    }

    const newConductor = data?.[0]
    if (!newConductor) {
      throw new Error('No conductor data returned')
    }

    console.log('[v0] New conductor created:', newConductor)

    // Generate password following LABBE standard and create auth record
    const conductorPassword = generateConductorPassword(rut)
    const passwordHash = await hashPassword(conductorPassword)

    const { error: authError } = await supabase
      .from('conductor_auth')
      .insert({
        rut: rut.replace(/\./g, '').trim(), // Normalize RUT (remove dots/spaces)
        conductor_id: newConductor.id,
        password_hash: passwordHash,
        is_active: true,
        created_at: new Date().toISOString(),
      })

    if (authError) {
      console.error('[v0] Error creating conductor auth:', authError)
      // Don't throw - conductor is already created, but log the error
      console.warn('[v0] Conductor created but auth record failed - conductor may not be able to login')
    } else {
      console.log('[v0] Conductor auth record created successfully')
    }

    // Create mandatory license classes for the conductor (A2 and A5 - old law licenses)
    const licenseClasses = ['A2', 'A5']
    
    const { data: licenseInsert } = await supabase
      .from('conductor_licenses')
      .insert(
        licenseClasses.map(licenseClass => ({
          conductor_id: newConductor.id,
          conductor_rut: rut,
          license_class: licenseClass,
          is_active: true,
          created_at: new Date().toISOString(),
        }))
      )

    if (licenseInsert) {
      console.log('[v0] License classes A2 and A5 created for conductor')
    }

    // Enable document uploads by creating conductor_settings
    const { error: settingsError } = await supabase
      .from('conductor_settings')
      .insert({
        conductor_id: newConductor.id,
        can_upload_documents: true,
        documents_enabled_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      })

    if (settingsError) {
      console.error('[v0] Error creating conductor settings:', settingsError)
      // Don't throw - conductor is already created
    } else {
      console.log('[v0] Document upload enabled for conductor:', newConductor.id)
    }

    return NextResponse.json({
      success: true,
      conductor: newConductor,
      message: 'Conductor creado exitosamente.',
      instructions: 'El conductor puede usar sus credenciales entregadas por el equipo Labbe para acceder y subir documentos. Se han asignado automáticamente las licencias de conducir clase A2 y A5 (ley antigua).'
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
