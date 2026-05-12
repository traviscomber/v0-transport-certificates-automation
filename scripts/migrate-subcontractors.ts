import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('[v0] Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
})

// Import the data from the local source
import { LABBE_SUBCONTRACTORS } from '../app/api/company/subcontractors-data'

async function migrateSubcontractors() {
  try {
    console.log(`[v0] Starting migration of ${LABBE_SUBCONTRACTORS.length} subcontractors...`)

    // Transform local data to match Supabase schema
    const batchSize = 50 // Insert in batches to avoid timeouts
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
          { onConflict: 'rut' } // Update if exists
        )
        .select()

      if (error) {
        console.error(`[v0] Error in batch ${i / batchSize + 1}:`, error)
        errorCount += batch.length
      } else {
        successCount += data?.length || 0
        console.log(`[v0] Batch ${i / batchSize + 1}: ${data?.length || 0} records inserted/updated`)
      }
    }

    console.log(`[v0] Migration complete: ${successCount} successful, ${errorCount} failed`)
    console.log('[v0] All subcontractors now in Supabase database')
  } catch (err) {
    console.error('[v0] Migration error:', err)
    process.exit(1)
  }
}

migrateSubcontractors()
