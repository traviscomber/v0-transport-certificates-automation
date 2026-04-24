import { createClient } from '@supabase/supabase-js'
import { allDriversData } from '../lib/data/all-drivers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function seedConductores() {
  const client = createClient(supabaseUrl, supabaseServiceKey)

  console.log('[v0] Starting to seed conductores table...')
  console.log('[v0] Total drivers to import:', allDriversData.length)

  try {
    // Transformar datos del formato local al formato de tabla
    const conductoresToInsert = allDriversData.map((driver) => ({
      id: driver.id,
      rut: driver.rut,
      nombres: driver.nombres,
      apellido_paterno: driver.apellido_paterno,
      apellido_materno: driver.apellido_materno,
      is_active: driver.is_active,
      transportista_id: driver.rut_proveedor, // Usar rut_proveedor como transportista_id
    }))

    console.log('[v0] First record to insert:', conductoresToInsert[0])

    // Usar upsert para evitar duplicados
    const { data, error } = await client
      .from('conductores')
      .upsert(conductoresToInsert, { onConflict: 'rut' })
      .select()

    if (error) {
      console.error('[v0] Error upserting conductores:', error)
      process.exit(1)
    }

    console.log('[v0] Successfully seeded', data?.length, 'conductores')
    console.log('[v0] Seed complete!')

    // Verificar que podemos buscar por RUT
    const { data: testDriver, error: testError } = await client
      .from('conductores')
      .select('id, rut, nombres')
      .eq('rut', '16181677-9')
      .single()

    if (testError) {
      console.error('[v0] Test query error:', testError)
    } else {
      console.log('[v0] Test query successful - Found:', testDriver)
    }

    process.exit(0)
  } catch (error) {
    console.error('[v0] Unexpected error:', error)
    process.exit(1)
  }
}

seedConductores()
