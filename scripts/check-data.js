import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function checkDatabase() {
  console.log('[v0] Checking Supabase database...\n')

  try {
    // Check transportistas
    const { data: transportistas, error: transError } = await supabase
      .from('transportistas')
      .select('*')
      .limit(10)

    if (transError) {
      console.log('[v0] Error checking transportistas:', transError.message)
    } else {
      console.log(`[v0] Transportistas found: ${transportistas?.length || 0}`)
      if (transportistas && transportistas.length > 0) {
        console.log('[v0] First record:', JSON.stringify(transportistas[0], null, 2))
      }
    }

    // Check conductores
    const { data: conductores, error: condError } = await supabase
      .from('conductores')
      .select('*')
      .limit(10)

    if (condError) {
      console.log('[v0] Error checking conductores:', condError.message)
    } else {
      console.log(`\n[v0] Conductores found: ${conductores?.length || 0}`)
      if (conductores && conductores.length > 0) {
        console.log('[v0] First record:', JSON.stringify(conductores[0], null, 2))
      }
    }

    // Check vehicles
    const { data: vehicles, error: vehicError } = await supabase
      .from('vehiculos')
      .select('*')
      .limit(10)

    if (vehicError) {
      console.log('[v0] Error checking vehiculos:', vehicError.message)
    } else {
      console.log(`\n[v0] Vehiculos found: ${vehicles?.length || 0}`)
      if (vehicles && vehicles.length > 0) {
        console.log('[v0] First record:', JSON.stringify(vehicles[0], null, 2))
      }
    }

    // Check documents
    const { data: docs, error: docError } = await supabase
      .from('uploaded_documents')
      .select('*')
      .limit(10)

    if (docError) {
      console.log('[v0] Error checking uploaded_documents:', docError.message)
    } else {
      console.log(`\n[v0] Documentos found: ${docs?.length || 0}`)
    }

    console.log('\n[v0] Database check complete!')
  } catch (error) {
    console.error('[v0] Unexpected error:', error)
  }
}

checkDatabase()
