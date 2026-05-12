import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { LABBE_SUBCONTRACTORS } from '@/app/api/company/subcontractors-data'

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Starting migration of', LABBE_SUBCONTRACTORS.length, 'transportistas to Supabase...')

    const supabase = createAdminClient()

    // First, delete all existing transportistas to ensure clean migration
    console.log('[v0] Clearing existing transportistas...')
    const { error: deleteError } = await supabase
      .from('transportistas')
      .delete()
      .neq('rut', 'placeholder') // Delete all

    if (deleteError) {
      console.error('[v0] Error clearing transportistas:', deleteError)
    }

    // Format transportistas for insertion from local data (only columns that exist in Supabase)
    // Remove duplicates by RUT to prevent CONFLICT error
    const seenRuts = new Set<string>()
    const transportistasForInsert = LABBE_SUBCONTRACTORS.filter(s => {
      if (seenRuts.has(s.rut)) {
        console.log('[v0] Skipping duplicate RUT:', s.rut, s.nombre)
        return false
      }
      seenRuts.add(s.rut)
      return true
    }).map(s => ({
      rut: s.rut,
      razon_social: s.nombre,
      // Note: Only include columns that exist in the transportistas table
      // region, comuna, representante, telefono, email will be added later if schema allows
      is_active: true,
      created_at: new Date().toISOString(),
    }))

    // Insert transportistas in batches of 50
    const batchSize = 50
    let insertedCount = 0

    for (let i = 0; i < transportistasForInsert.length; i += batchSize) {
      const batch = transportistasForInsert.slice(i, i + batchSize)
      
      const { data, error } = await supabase
        .from('transportistas')
        .upsert(batch, { onConflict: 'rut' })
        .select()

      if (error) {
        console.error('[v0] Error inserting batch', Math.floor(i / batchSize), ':', error)
        throw error
      }

      insertedCount += data?.length || 0
      console.log('[v0] Batch', Math.floor(i / batchSize) + 1, '/', Math.ceil(transportistasForInsert.length / batchSize), 'completed')
    }

    console.log('[v0] Successfully migrated', insertedCount, 'transportistas to Supabase')

    return NextResponse.json({
      success: true,
      message: `Migrated ${insertedCount} transportistas to Supabase`,
      count: insertedCount,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('[v0] Migration error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || error?.code || JSON.stringify(error) || 'Unknown error',
        details: error
      },
      { status: 500 }
    )
  }
}
