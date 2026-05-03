import { createClient } from '@supabase/supabase-js'
import { allDriversData } from '../lib/data/all-drivers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function syncDriversToSupabase() {
  try {
    console.log('[v0] Starting driver sync to Supabase...')
    console.log(`[v0] Found ${allDriversData.length} drivers to sync`)

    // Prepare driver records for insertion
    const driversToInsert = allDriversData.map(driver => ({
      id: driver.id,
      rut: driver.rut,
      nombres: driver.nombres,
      apellido_paterno: driver.apellido_paterno,
      apellido_materno: driver.apellido_materno,
      nombre_completo: driver.nombre,
      rut_proveedor: driver.rut_proveedor,
      proveedor: driver.proveedor,
      patente_tracto: driver.patente_tracto,
      clase_licencia: driver.clase_licencia,
      is_active: driver.is_active,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))

    // Delete existing data
    console.log('[v0] Clearing existing conductores data...')
    const { error: deleteError } = await supabase
      .from('conductores')
      .delete()
      .neq('id', '')

    if (deleteError) {
      console.error('[v0] Error deleting existing data:', deleteError)
    } else {
      console.log('[v0] Existing data cleared')
    }

    // Insert drivers in batches
    const batchSize = 50
    for (let i = 0; i < driversToInsert.length; i += batchSize) {
      const batch = driversToInsert.slice(i, i + batchSize)
      const { error, data } = await supabase
        .from('conductores')
        .insert(batch)
        .select()

      if (error) {
        console.error(`[v0] Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error)
      } else {
        console.log(`[v0] Batch ${Math.floor(i / batchSize) + 1} inserted: ${data?.length || 0} records`)
      }
    }

    // Verify the sync
    const { data: allConductores, error: fetchError } = await supabase
      .from('conductores')
      .select('id, rut, nombres')

    if (fetchError) {
      console.error('[v0] Error verifying sync:', fetchError)
    } else {
      console.log(`[v0] ✅ Sync complete! Total drivers in Supabase: ${allConductores?.length || 0}`)
      
      // Show sample
      if (allConductores && allConductores.length > 0) {
        console.log('[v0] Sample drivers:')
        allConductores.slice(0, 5).forEach(driver => {
          console.log(`  - ${driver.rut}: ${driver.nombres}`)
        })
      }
    }
  } catch (error) {
    console.error('[v0] Fatal error during sync:', error)
    process.exit(1)
  }
}

syncDriversToSupabase()
