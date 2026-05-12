import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { LABBE_SUBCONTRACTORS } from '../../company/subcontractors-data'

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Missing Supabase credentials' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    })

    console.log(`[v0] Starting migration of ${LABBE_SUBCONTRACTORS.length} subcontractors...`)

    // Transform local data to match Supabase schema
    const batchSize = 50
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < LABBE_SUBCONTRACTORS.length; i += batchSize) {
      const batch = LABBE_SUBCONTRACTORS.slice(i, i + batchSize)

      const { data, error } = await supabase
        .from('subcontractors')
        .upsert(
          batch.map((sub: any) => ({
            rut: sub.rut,
            nombre: sub.nombre,
            representante: sub.representante,
            ejecutivo_nombre: sub.ejecutiva,
            region: sub.region,
            direccion: sub.direccion,
            comuna: sub.comuna,
            telefono: sub.telefono,
            email: sub.email,
            ariztia: sub.ariztia,
            lts: sub.lts,
            rendic: sub.rendic,
            interpolar: sub.interpolar,
          })),
          { onConflict: 'rut' }
        )
        .select()

      if (error) {
        console.error(`[v0] Error in batch ${i / batchSize + 1}:`, error)
        errorCount += batch.length
      } else {
        successCount += data?.length || 0
        console.log(`[v0] Batch ${i / batchSize + 1}: ${data?.length || 0} records`)
      }
    }

    console.log(`[v0] Migration complete: ${successCount} successful, ${errorCount} failed`)

    return NextResponse.json({
      message: 'Migration complete',
      successful: successCount,
      failed: errorCount,
      total: LABBE_SUBCONTRACTORS.length,
    })
  } catch (error) {
    console.error('[v0] Migration endpoint error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Migration failed' },
      { status: 500 }
    )
  }
}
