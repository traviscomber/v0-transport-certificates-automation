import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('[v0] Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  try {
    console.log('[v0] Reading migration file...')
    
    const migrationPath = path.join(__dirname, '../migrations/002_add_ai_document_metadata.sql')
    const sql = fs.readFileSync(migrationPath, 'utf-8')
    
    console.log('[v0] Executing migration SQL...')
    console.log('[v0] SQL length:', sql.length, 'characters')
    
    // Execute the SQL using Supabase's query method
    const { data, error } = await supabase.rpc('execute_sql', {
      sql_query: sql
    }).single()
    
    if (error) {
      // If rpc doesn't exist, try direct query
      console.log('[v0] RPC failed, trying direct query approach...')
      // For Supabase, we need to use the admin API or run via dashboard
      console.log('[v0] Please run the migration manually in Supabase dashboard:')
      console.log('[v0] 1. Go to supabase.com and open your project')
      console.log('[v0] 2. Navigate to SQL Editor')
      console.log('[v0] 3. Create new query and paste the SQL from migrations/002_add_ai_document_metadata.sql')
      process.exit(1)
    }
    
    console.log('[v0] Migration executed successfully!')
    console.log('[v0] Result:', data)
    
  } catch (error) {
    console.error('[v0] Migration failed:', error)
    process.exit(1)
  }
}

runMigration()
