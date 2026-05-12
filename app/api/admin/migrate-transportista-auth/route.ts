import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()

    // Get all transportistas
    const { data: transportistas, error: fetchError } = await supabase
      .from('transportistas')
      .select('id, rut')
      .eq('is_active', true)

    if (fetchError) {
      console.error('[v0] Error fetching transportistas:', fetchError)
      return NextResponse.json(
        { error: 'Error fetching transportistas' },
        { status: 500 }
      )
    }

    if (!transportistas || transportistas.length === 0) {
      return NextResponse.json(
        { error: 'No active transportistas found' },
        { status: 404 }
      )
    }

    console.log(`[v0] Found ${transportistas.length} transportistas to migrate`)

    // Generate auth records for each transportista
    const authRecords = await Promise.all(
      transportistas.map(async (t) => {
        // Extract last 4 digits from RUT
        const rutDigits = t.rut.replace(/[.\-]/g, '').slice(-4)
        const password = `labbe${rutDigits}`
        const passwordHash = await bcrypt.hash(password, 10)

        return {
          rut: t.rut,
          transportista_id: t.id,
          password_hash: passwordHash,
          is_active: true,
        }
      })
    )

    console.log(`[v0] Generated ${authRecords.length} auth records`)

    // Insert auth records (upsert)
    const { error: insertError, data: inserted } = await supabase
      .from('transportista_auth')
      .upsert(authRecords, { onConflict: 'rut' })
      .select()

    if (insertError) {
      console.error('[v0] Error inserting auth records:', insertError)
      return NextResponse.json(
        { error: 'Error creating auth records' },
        { status: 500 }
      )
    }

    console.log(`[v0] Successfully created/updated ${inserted?.length || 0} auth records`)

    return NextResponse.json({
      success: true,
      message: `Successfully created authentication for ${inserted?.length || 0} subcontractors`,
      count: inserted?.length || 0,
    })

  } catch (error) {
    console.error('[v0] Error in transportista auth migration:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
