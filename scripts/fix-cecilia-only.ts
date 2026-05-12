import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
})

async function fixCeciliaOnly() {
  try {
    console.log('[v0] Replacing only Cecilia records with Javiera in database...')
    
    // Update transportistas table - replace only Cecilia with Javiera
    const { error: error1, count: count1 } = await supabase
      .from('transportistas')
      .update({ ejecutivo_nombre: 'Javiera' })
      .eq('ejecutivo_nombre', 'Cecilia')
    
    if (error1) {
      console.error('[v0] Error updating transportistas:', error1)
    } else {
      console.log(`[v0] Updated ${count1} transportistas records`)
    }

    console.log('[v0] Done! Cecilia records replaced with Javiera')
    console.log('[v0] Other ejecutivas (Daniela, Olga, Carolina, etc.) remain unchanged')
  } catch (err) {
    console.error('[v0] Exception:', err)
  }
}

fixCeciliaOnly()
