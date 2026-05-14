import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkDocument() {
  try {
    // Search for MUTUAL ABRIL 2026 WALMART.pdf in subcontractor_documents
    const { data, error } = await supabase
      .from('subcontractor_documents')
      .select('id, file_name, document_type_id, created_at, status')
      .ilike('file_name', '%MUTUAL ABRIL 2026 WALMART%')
      .single()

    if (error && error.code !== 'PGRST116') {
      console.log('Error:', error.message)
      return
    }

    if (data) {
      console.log('\n=== DOCUMENTO EN BD (subcontractor_documents) ===')
      console.log('Archivo:', data.file_name)
      console.log('Estado:', data.status)
      console.log('Creado en BD:', data.created_at)
    } else {
      console.log('No encontrado en subcontractor_documents, buscando en conductor_documents...')
    }
  } catch (err) {
    console.error('Error:', err.message)
  }
}

checkDocument()
