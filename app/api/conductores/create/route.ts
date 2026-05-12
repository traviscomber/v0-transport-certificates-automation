import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { hashPassword } from '@/lib/supabase/auth-conductor'
import { randomBytes } from 'crypto'

/**
 * Generates a temporary password for the new conductor
 * Format: Last 4 digits of RUT + random 4 digits
 * Example: If RUT ends with 7-4 and random is 8921, password is "74898921"
 */
function generateTemporaryPassword(rut: string): string {
  const lastDigits = rut.replace(/[^0-9K]/g, '').slice(-4)
  const randomPart = randomBytes(2).readUInt16BE(0) % 10000
  return `${lastDigits}${String(randomPart).padStart(4, '0')}`
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

    // Generate temporary password and create auth record
    const temporaryPassword = generateTemporaryPassword(rut)
    const passwordHash = await hashPassword(temporaryPassword)

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
      temporaryPassword: temporaryPassword,
      message: `Conductor creado exitosamente. Contraseña temporal: ${temporaryPassword}`,
      instructions: 'El conductor puede usar su RUT y esta contraseña temporal para acceder y subir documentos.'
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
