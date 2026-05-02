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
      .select('id, title, description, metadata')
      .like('description', '%Sin especificar%')
      .eq('type', 'document_status_change')
    
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
    for (const alert of alerts) {
      const newDescription = alert.description?.replace(
        'Razón: Sin especificar',
        'Razón: No especificada en el rechazo'
      ) || alert.description
      
      const { error: updateError } = await client
        .from('alerts')
        .update({
          description: newDescription,
          updated_at: new Date().toISOString()
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
  }
}

updateRejectionReasons()
