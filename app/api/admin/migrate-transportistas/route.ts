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

    // Format transportistas for insertion from local data (only existing columns)
    const transportistasForInsert = LABBE_SUBCONTRACTORS.map(s => ({
      rut: s.rut,
      razon_social: s.nombre,
      region: s.region || '',
      comuna: s.comuna || '',
      nombre_contacto: s.representante || '',
      telefono: s.telefono || '',
      email: s.email || '',
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
