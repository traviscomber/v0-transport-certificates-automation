import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkDocument() {
  try {
    // Get all fields
    const { data, error } = await supabase
      .from('subcontractor_documents')
      .select('*')
      .ilike('file_name', '%MUTUAL ABRIL 2026 WALMART%')
      .single()

    if (error) {
      console.log('Error:', error.message)
      return
    }

    if (data) {
      console.log('\n=== TODOS LOS CAMPOS DEL DOCUMENTO ===')
      Object.keys(data).forEach(key => {
        if (typeof data[key] === 'string' && data[key].includes('2026')) {
          console.log(`${key}: ${data[key]}`)
        } else if (data[key] === null || data[key] === undefined) {
          // skip nulls
        }
      })
      console.log('\n=== TIMESTAMPS ===')
      console.log('created_at:', data.created_at)
      console.log('updated_at:', data.updated_at)
      console.log('reviewed_at:', data.reviewed_at)
      console.log('approval_timestamp:', data.approval_timestamp)
    }
  } catch (err) {
    console.error('Error:', err.message)
  }
}

checkDocument()
