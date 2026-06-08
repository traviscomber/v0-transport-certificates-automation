import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function check() {
  console.log('\n=== CHECKING SUBCONTRACTOR DOCUMENT STATUSES ===\n')
  
  // Get all unique statuses
  const { data } = await supabase
    .from('subcontractor_documents')
    .select('status')

  const statuses = {}
  data?.forEach(d => {
    statuses[d.status] = (statuses[d.status] || 0) + 1
  })

  console.log('Status distribution:', statuses)
  
  // Get counts for each status
  for (const status of Object.keys(statuses)) {
    const { count } = await supabase
      .from('subcontractor_documents')
      .select('*', { count: 'exact', head: true })
      .eq('status', status)
    console.log(`  - "${status}": ${count} documents`)
  }
  
  console.log('\nExpected for "approved": ~1519 documents')
}

check().catch(e => console.error('Error:', e.message))
