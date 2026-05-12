import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Starting password regeneration...')
    const supabase = createAdminClient()

    // Get all subcontractors
    const { data: subcontractors, error: fetchError } = await supabase
      .from('transportistas')
      .select('id, rut')
      .eq('is_active', true)

    if (fetchError || !subcontractors) {
      return NextResponse.json({ error: 'Error fetching subcontractors', details: fetchError?.message }, { status: 500 })
    }

    console.log(`[v0] Found ${subcontractors.length} subcontractors`)

    let successCount = 0
    let errorCount = 0

    // Process in batches
    for (let i = 0; i < subcontractors.length; i += 50) {
      const batch = subcontractors.slice(i, i + 50)

      const updates = await Promise.all(
        batch.map(async (sub) => {
          const last4 = sub.rut.slice(-4).replace(/[^0-9]/g, '')
          const password = `labbe${last4}`
          const hash = await bcrypt.hash(password, 10)

          console.log(`[v0] Generated hash for ${sub.rut}: labbe${last4}`)

          return {
            rut: sub.rut,
            transportista_id: sub.id,
            password_hash: hash,
            is_active: true,
          }
        })
      )

      // Upsert into transportista_auth
      const { error: upsertError } = await supabase
        .from('transportista_auth')
        .upsert(updates, { onConflict: 'rut' })

      if (upsertError) {
        console.error('[v0] Upsert error:', upsertError)
        errorCount += batch.length
      } else {
        successCount += batch.length
        console.log(`[v0] Batch ${Math.floor(i / 50) + 1}: ${batch.length} records updated`)
      }
    }

    console.log(`[v0] Regeneration complete: ${successCount} success, ${errorCount} errors`)

    return NextResponse.json({
      success: true,
      message: 'Passwords regenerated',
      results: { successCount, errorCount, total: subcontractors.length },
    })

  } catch (error) {
    console.error('[v0] Regeneration error:', error)
    return NextResponse.json(
      { error: 'Regeneration failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
