import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

/**
 * API Endpoint to migrate subcontractor document types
 * Removes: AFP, SALUD, MUTUAL, SEGURO_SOCIAL
 * Adds: PLANILLAS_IMPOSICIONES, PENSION
 */

export async function POST(request: NextRequest) {
  try {
    // Verify this is an admin/internal call
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('[v0] Starting document type migration')

    // Step 1: Mark old types as inactive
    console.log('[v0] Marking old document types as inactive')
    const { error: updateError } = await supabase
      .from('subcontractor_document_types')
      .update({ es_obligatorio: false })
      .in('code', ['AFP', 'SALUD', 'MUTUAL', 'SEGURO_SOCIAL'])

    if (updateError) {
      console.error('[v0] Error marking old types:', updateError)
      return NextResponse.json(
        { error: 'Failed to mark old types', details: updateError },
        { status: 500 }
      )
    }

    // Step 2: Insert new document types
    console.log('[v0] Inserting new document types')
    const { error: insertError } = await supabase
      .from('subcontractor_document_types')
      .upsert([
        {
          code: 'PLANILLAS_IMPOSICIONES',
          nombre: 'Planillas de Imposiciones',
          descripcion: 'Planillas mensuales de imposiciones de los trabajadores',
          periodicidad: 'Mensual',
          es_obligatorio: true,
        },
        {
          code: 'PENSION',
          nombre: 'Pensión',
          descripcion: 'Comprobantes de pensión y/o jubilación',
          periodicidad: 'Mensual',
          es_obligatorio: true,
        },
      ])

    if (insertError) {
      console.error('[v0] Error inserting new types:', insertError)
      return NextResponse.json(
        { error: 'Failed to insert new types', details: insertError },
        { status: 500 }
      )
    }

    console.log('[v0] Migration completed successfully')

    return NextResponse.json({
      success: true,
      message: 'Document types migrated successfully',
      changes: {
        removed: ['AFP', 'SALUD', 'MUTUAL', 'SEGURO_SOCIAL'],
        added: ['PLANILLAS_IMPOSICIONES', 'PENSION'],
      },
    })
  } catch (error) {
    console.error('[v0] Migration error:', error)
    return NextResponse.json(
      { error: 'Migration failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
