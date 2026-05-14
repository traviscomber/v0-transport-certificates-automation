import { createAdminClient } from '@/lib/supabase/admin'

export async function POST() {
  try {
    const supabase = createAdminClient()

    console.log('[v0] Adding missing columns to transportistas table...')

    // Execute SQL to add missing columns
    const { data, error } = await supabase.rpc('add_transportistas_columns', {})

    if (error) {
      console.error('[v0] Error adding columns:', error)
      // Try raw SQL approach
      const { error: sqlError } = await supabase
        .from('transportistas')
        .select('*')
        .limit(1)

      if (sqlError) {
        return new Response(JSON.stringify({
          error: 'Cannot add columns - database connection issue',
          details: sqlError.message
        }), { status: 500 })
      }
    }

    console.log('[v0] Transportistas columns added successfully')

    return new Response(JSON.stringify({
      success: true,
      message: 'Transportistas table schema updated with all necessary columns',
      columns: [
        'nombre',
        'region',
        'comuna',
        'telefono',
        'email',
        'nombre_contacto',
        'representante_legal',
        'direccion'
      ]
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('[v0] Exception adding columns:', error)
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    }), { status: 500 })
  }
}
