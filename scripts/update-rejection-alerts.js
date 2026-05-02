const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('[v0] Missing Supabase credentials')
  process.exit(1)
}

const client = createClient(supabaseUrl, supabaseKey)

async function updateRejectionReasons() {
  try {
    console.log('[v0] Fetching rejection alerts without reason...')
    
    // Get all rejection alerts that have "Sin especificar" in their message
    const { data: alerts, error: fetchError } = await client
      .from('alerts')
      .select('id, title, message, type')
      .like('message', '%Sin especificar%')
    
    if (fetchError) {
      console.error('[v0] Error fetching alerts:', fetchError)
      return
    }
    
    console.log(`[v0] Found ${alerts?.length || 0} alerts to update`)
    
    if (!alerts || alerts.length === 0) {
      console.log('[v0] No alerts to update')
      return
    }
    
    // Update each alert with a generic reason
    const genericReason = 'Documento no cumple con los requisitos establecidos'
    
    for (const alert of alerts) {
      const newMessage = alert.message?.replace(
        'Razón: Sin especificar',
        `Razón: ${genericReason}`
      ) || alert.message
      
      const { error: updateError } = await client
        .from('alerts')
        .update({
          message: newMessage
        })
        .eq('id', alert.id)
      
      if (updateError) {
        console.error(`[v0] Error updating alert ${alert.id}:`, updateError)
      } else {
        console.log(`[v0] Updated alert ${alert.id}`)
      }
    }
    
    console.log('[v0] All alerts updated successfully!')
  } catch (err) {
    console.error('[v0] Unexpected error:', err)
  } finally {
    process.exit(0)
  }
}

updateRejectionReasons()
