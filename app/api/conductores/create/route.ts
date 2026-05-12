import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { hashPassword } from '@/lib/supabase/auth-conductor'

/**
 * Generates password for the new conductor following LABBE standard
 * Format: "labbe" + last 4 digits of RUT (only numbers)
 * Example: If RUT is 10958706-0, password is "labbe0706"
 *          If RUT is 12671737-7, password is "labbe1737"
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

    return NextResponse.json({
      success: true,
      conductor: newConductor,
      password: conductorPassword,
      message: `Conductor creado exitosamente. Contraseña: ${conductorPassword}`,
      instructions: 'El conductor puede usar su RUT y esta contraseña para acceder y subir documentos.'
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
