import { createClient } from '@supabase/supabase-js'

async function checkAndAddColumn() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('[v0] Missing Supabase credentials')
    return
  }

  const client = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // Try to read the table to check if column exists
    console.log('[v0] Checking if rejection_reason column exists...')
    const { data, error } = await client
      .from('uploaded_documents')
      .select('rejection_reason')
      .limit(1)

    if (error && error.code === 'PGRST103') {
      // Column doesn't exist, we need to add it
      console.log('[v0] Column does not exist, attempting to add it...')
      
      // Use the admin API to execute the ALTER TABLE command
      const { error: alterError } = await client.rpc('exec_sql', {
        sql: 'ALTER TABLE uploaded_documents ADD COLUMN rejection_reason TEXT;'
      })

      if (alterError) {
        console.error('[v0] RPC exec_sql not available, trying alternative method...')
        // If RPC doesn't work, the column might need to be added through Supabase Dashboard
        console.log('[v0] Please add the rejection_reason column manually in Supabase Dashboard')
        return false
      }

      console.log('[v0] Column added successfully')
      return true
    } else if (error) {
      console.error('[v0] Error checking column:', error)
      return false
    } else {
      console.log('[v0] rejection_reason column already exists')
      return true
    }
  } catch (err) {
    console.error('[v0] Unexpected error:', err)
    return false
  }
}

checkAndAddColumn().then(success => {
  process.exit(success ? 0 : 1)
})
