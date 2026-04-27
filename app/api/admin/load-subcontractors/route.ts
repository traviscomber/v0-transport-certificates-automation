import { createClient } from '@supabase/supabase-js'
import { allSubcontractorsData } from '@/lib/data/all-subcontractors'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('[v0] Starting to load 221 real subcontractors into Supabase...')

    // Get existing count
    const { count: existingCount } = await supabase
      .from('transportistas')
      .select('id', { count: 'exact', head: true })

    console.log(`[v0] Currently in DB: ${existingCount} transportistas`)

    if (existingCount && existingCount > 10) {
      return Response.json({
        message: 'Database already populated with real data',
        count: existingCount
      })
    }

    // Format and insert all subcontractors
    const dataToInsert = allSubcontractorsData.map((sub: any) => ({
      rut: sub.rut,
      razon_social: sub.razon_social,
      nombre_fantasia: sub.nombre_fantasia || '',
      direccion: sub.direccion || '',
      comuna: sub.comuna || '',
      region: sub.region || '',
      representante: sub.representante || '',
      email: sub.email || '',
      telefono: sub.telefono || '',
      is_active: sub.is_active !== false,
      created_at: new Date().toISOString(),
    }))

    console.log(`[v0] Inserting ${dataToInsert.length} transportistas...`)

    // Batch insert in chunks of 100
    const chunkSize = 100
    for (let i = 0; i < dataToInsert.length; i += chunkSize) {
      const chunk = dataToInsert.slice(i, i + chunkSize)
      const { error } = await supabase
        .from('transportistas')
        .insert(chunk)

      if (error) {
        console.error(`[v0] Error inserting chunk ${i / chunkSize + 1}:`, error)
        throw error
      }
      console.log(`[v0] Inserted chunk ${i / chunkSize + 1}/${Math.ceil(dataToInsert.length / chunkSize)}`)
    }

    console.log('[v0] Successfully loaded all subcontractors')

    return Response.json({
      message: 'Successfully loaded 221 real subcontractors',
      count: dataToInsert.length
    })
  } catch (error) {
    console.error('[v0] Error loading subcontractors:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
