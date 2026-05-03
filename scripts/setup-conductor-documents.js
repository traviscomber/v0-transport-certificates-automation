import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupTable() {
  try {
    console.log('[v0] Creating conductor_uploaded_documents table...')
    
    const { error } = await supabase.rpc('sql', {
      query: `
        CREATE TABLE IF NOT EXISTS public.conductor_uploaded_documents (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          driver_id TEXT NOT NULL,
          document_type VARCHAR(255) NOT NULL,
          file_name VARCHAR(255) NOT NULL,
          file_url TEXT,
          status VARCHAR(50) DEFAULT 'pending',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );

        CREATE INDEX IF NOT EXISTS idx_conductor_docs_driver ON conductor_uploaded_documents(driver_id);
        
        ALTER TABLE conductor_uploaded_documents ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "conductor_docs_select" ON conductor_uploaded_documents;
        DROP POLICY IF EXISTS "conductor_docs_insert" ON conductor_uploaded_documents;
        
        CREATE POLICY "conductor_docs_select" ON conductor_uploaded_documents FOR SELECT USING (true);
        CREATE POLICY "conductor_docs_insert" ON conductor_uploaded_documents FOR INSERT WITH CHECK (true);
      `
    })

    if (error) {
      console.log('[v0] RPC not available, trying direct SQL execution...')
      // Si RPC no existe, intentar direct SQL
      const { error: sqlError } = await supabase
        .from('conductor_uploaded_documents')
        .select('id')
        .limit(1)
      
      if (sqlError?.code === 'PGRST116') {
        console.log('[v0] Table does not exist yet')
      } else {
        console.log('[v0] Table already exists or SQL error:', sqlError)
      }
    } else {
      console.log('[v0] Table created successfully')
    }
  } catch (err) {
    console.error('[v0] Setup error:', err)
    process.exit(1)
  }
}

setupTable()
