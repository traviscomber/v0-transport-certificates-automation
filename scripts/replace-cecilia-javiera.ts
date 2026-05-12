import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
})

async function replaceExecutiva() {
  try {
    console.log('[v0] Starting Cecilia → Javiera replacement in database...')

    // Update in subcontractors table
    const { data: updateSubcontractors, error: errorSub } = await supabase
      .from('subcontractors')
      .update({ ejecutiva: 'Javiera' })
      .eq('ejecutiva', 'Cecilia')
      .select('count')

    if (errorSub) {
      console.error('[v0] Error updating subcontractors:', errorSub)
    } else {
      console.log('[v0] Updated subcontractors ejecutiva field')
    }

    // Update region field if it exists
    const { error: errorRegion } = await supabase
      .from('subcontractors')
      .update({ region: 'Javiera' })
      .eq('region', 'Cecilia')

    if (errorRegion) {
      console.log('[v0] Region field update note:', errorRegion.message)
    } else {
      console.log('[v0] Updated subcontractors region field')
    }

    // Update in conductors table if it has ejecutiva field
    const { error: errorConductors } = await supabase
      .from('conductors')
      .update({ ejecutiva: 'Javiera' })
      .eq('ejecutiva', 'Cecilia')

    if (errorConductors) {
      console.log('[v0] Conductors update note:', errorConductors.message)
    } else {
      console.log('[v0] Updated conductors ejecutiva field')
    }

    console.log('[v0] Cecilia → Javiera replacement completed!')
  } catch (err) {
    console.error('[v0] Exception:', err)
  }
}

replaceExecutiva()
