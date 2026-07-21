import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { hashPassword } from '@/lib/supabase/auth-conductor'

/**
 * Regenerates LABBE-format password for a conductor
 * Format: "labbe" + last 4 digits of RUT before check digit
 */
function generateConductorPassword(rut: string): string {
  const rutNumbers = rut.replace(/[^0-9K]/g, '')
  const last4Digits = rutNumbers.slice(-5, -1)
  return `labbe${last4Digits}`
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()

    // Get all conductores that don't have auth records
    const { data: allConductores, error: fetchError } = await supabase
      .from('conductores')
      .select('id, rut, nombres')
      .eq('is_active', true)

    if (fetchError) {
      throw fetchError
    }

    console.log('[v0] Found', allConductores?.length, 'conductores')

    // Get all existing auth records
    const { data: existingAuth, error: authFetchError } = await supabase
      .from('conductor_auth')
      .select('rut')

    if (authFetchError) {
      throw authFetchError
    }

    const existingRuts = new Set((existingAuth || []).map(a => a.rut))
    console.log('[v0] Found', existingAuth?.length, 'existing auth records')

    // Find conductores without auth records
    const conductoresToAuth = (allConductores || []).filter(c => {
      const normalizedRut = c.rut.replace(/\./g, '').trim()
      return !existingRuts.has(normalizedRut)
    })

    console.log('[v0] Found', conductoresToAuth.length, 'conductores missing auth records')

    if (conductoresToAuth.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All conductores have auth records',
        created: 0,
        errors: 0
      })
    }

    let created = 0
    let errors = 0

    // Create auth records for each conductor
    for (const conductor of conductoresToAuth) {
      try {
        const normalizedRut = conductor.rut.replace(/\./g, '').trim()
        const password = generateConductorPassword(conductor.rut)
        const passwordHash = await hashPassword(password)

        const { error: insertError } = await supabase
          .from('conductor_auth')
          .insert({
            rut: normalizedRut,
            conductor_id: conductor.id,
            password_hash: passwordHash,
            is_active: true,
            created_at: new Date().toISOString(),
          })

        if (insertError) {
          console.error('[v0] Error creating auth for RUT', normalizedRut, ':', insertError)
          errors++
        } else {
          console.log('[v0] Created auth record for RUT', normalizedRut)
          created++
        }
      } catch (err) {
        console.error('[v0] Exception creating auth:', err)
        errors++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Migración completada: ${created} registros creados, ${errors} errores`,
      created,
      errors,
      totalConductores: allConductores?.length
    })
  } catch (error) {
    console.error('[v0] Migration error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
