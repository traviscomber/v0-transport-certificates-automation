import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkPendingDocuments() {
  try {
    // Get recent pending documents
    const { data, error } = await supabase
      .from('subcontractor_documents')
      .select('id, file_name, created_at, updated_at, status')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) {
      console.log('Error:', error.message)
      return
    }

    if (data && data.length > 0) {
      console.log('\n=== DOCUMENTOS PENDIENTES RECIENTES ===')
      data.forEach((doc, i) => {
        console.log(`\n${i + 1}. ${doc.file_name}`)
        console.log(`   Status: ${doc.status}`)
        console.log(`   Created at (BD): ${doc.created_at}`)
        console.log(`   Updated at (BD): ${doc.updated_at}`)
      })
    }

    // Also check conductor_documents pending
    const { data: condData, error: condError } = await supabase
      .from('conductor_documents')
      .select('id, file_name, created_at, updated_at, status')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5)

    if (condData && condData.length > 0) {
      console.log('\n=== DOCUMENTOS PENDIENTES DE CONDUCTORES ===')
      condData.forEach((doc, i) => {
        console.log(`\n${i + 1}. ${doc.file_name}`)
        console.log(`   Status: ${doc.status}`)
        console.log(`   Created at (BD): ${doc.created_at}`)
        console.log(`   Updated at (BD): ${doc.updated_at}`)
      })
    }
  } catch (err) {
    console.error('Error:', err.message)
  }
}

checkPendingDocuments()
