import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateDefaultPassword } from '@/lib/password-utils'
import bcrypt from 'bcryptjs'

/**
 * POST /api/admin/setup-subcontractor-auth
 * Complete setup for subcontractor authentication:
 * Migrates all subcontractors with auto-generated passwords
 * NOTE: transportista_auth table must be created first via Supabase SQL Editor
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Starting subcontractor auth migration...')
    const supabase = createAdminClient()

    // Get all subcontractors
    console.log('[v0] Fetching all subcontractors...')
    const { data: subcontractors, error: fetchError } = await supabase
      .from('transportistas')
      .select('id, rut')
      .eq('is_active', true)

    if (fetchError || !subcontractors) {
      console.error('[v0] Error fetching subcontractors:', fetchError)
      return NextResponse.json(
        { error: 'Error fetching subcontractors', details: fetchError?.message },
        { status: 500 }
      )
    }

    console.log(`[v0] Found ${subcontractors.length} active subcontractors`)

    // Generate and insert auth records
    const batchSize = 50
    let successCount = 0
    let errorCount = 0
    const createdRecords: any[] = []

    for (let i = 0; i < subcontractors.length; i += batchSize) {
      const batch = subcontractors.slice(i, i + batchSize)

      const authRecords = await Promise.all(
        batch.map(async (sub) => {
          const password = generateDefaultPassword(sub.rut)
          const passwordHash = await bcrypt.hash(password, 10)

          return {
            rut: sub.rut,
            transportista_id: sub.id,
            password_hash: passwordHash,
            is_active: true,
          }
        })
      )

      // Insert or update auth records
      const { error: insertError } = await supabase
        .from('transportista_auth')
        .upsert(authRecords, { onConflict: 'rut' })

      if (insertError) {
        console.error('[v0] Error inserting batch:', insertError)
        errorCount += batch.length
      } else {
        successCount += batch.length
        createdRecords.push(...authRecords)
        console.log(`[v0] Batch ${Math.floor(i / batchSize) + 1}: Inserted/updated ${batch.length} records`)
      }
    }

    console.log(`[v0] Migration complete: ${successCount} success, ${errorCount} errors`)

    return NextResponse.json({
      success: true,
      message: 'Subcontractor auth migration complete',
      results: {
        totalSubcontractors: subcontractors.length,
        successCount,
        errorCount,
        passwordFormat: 'labbe + last 4 digits of RUT',
      },
      instructions: {
        login_url: 'https://cleaner2.vercel.app/subcontractors/login',
        example_rut: subcontractors[0]?.rut || 'XX.XXX.XXX-X',
        example_password: `labbe${subcontractors[0]?.rut?.slice(-4).replace(/[^0-9]/g, '') || 'XXXX'}`,
      },
    })

  } catch (error) {
    console.error('[v0] Error in setup endpoint:', error)
    return NextResponse.json(
      {
        error: 'Setup failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
