import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
})

async function checkEjecutivas() {
  try {
    console.log('[v0] Checking ejecutivas in database...')
    
    // Get all transportistas  
    const { data, error } = await supabase
      .from('transportistas')
      .select('ejecutivo_nombre, id')
      .limit(300)
    
    if (error) {
      console.error('[v0] Error:', error)
      return
    }
    
    console.log(`[v0] Total records fetched: ${data?.length || 0}`)
    
    // Count occurrences of each ejecutiva
    const counts: Record<string, number> = {}
    data?.forEach((record: any) => {
      const ejecutiva = record.ejecutivo_nombre || 'Sin asignar'
      counts[ejecutiva] = (counts[ejecutiva] || 0) + 1
    })
    
    console.log('[v0] Ejecutivas found:')
    Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([name, count]) => {
        console.log(`  - "${name}": ${count} records`)
      })
    
    console.log('[v0] Ejecutivas in database:')
    Object.entries(counts).forEach(([name, count]) => {
      console.log(`  - ${name}: ${count} records`)
    })
    
    // Check for Cecilia specifically
    const cecilaCount = (data || []).filter((r: any) => 
      r.ejecutiva_nombre?.includes('Cecilia')
    ).length
    
    if (cecilaCount > 0) {
      console.log(`[v0] WARNING: Found ${cecilaCount} records with Cecilia!`)
    } else {
      console.log('[v0] ✓ No Cecilia found in database')
    }
  } catch (err) {
    console.error('[v0] Exception:', err)
  }
}

checkEjecutivas()
