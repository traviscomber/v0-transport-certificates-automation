const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRLS() {
  try {
    console.log('[v0] Checking RLS policies...\n');

    // Query RLS policies
    const { data: policies, error: policiesError } = await supabase
      .rpc('pgrst_describe', {})
      .catch(e => {
        console.log('pgrst_describe not available, trying alternate method...');
        return { data: null, error: e };
      });

    // Try to get policies from information_schema
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(50);

    if (tablesError) {
      console.log('Cannot query information_schema directly');
    } else {
      console.log('Public tables:', tables?.map(t => t.table_name).join(', '));
    }

    // Check documents table specifically
    console.log('\n=== TESTING DOCUMENTS TABLE ===');
    const { data: docs, error: docsError } = await supabase
      .from('documents')
      .select('*')
      .limit(1);

    if (docsError) {
      console.log('Error accessing documents:', docsError.message);
      console.log('Error code:', docsError.code);
      console.log('Error details:', docsError);
    } else {
      console.log('Documents table accessible, found:', docs?.length || 0, 'records');
    }

    // Try to insert a test document
    console.log('\n=== TESTING INSERT ===');
    const testDoc = {
      conductor_id: '00000000-0000-0000-0000-000000000001',
      transportista_id: '00000000-0000-0000-0000-000000000001',
      document_type: 'license',
      file_url: 'test.pdf',
      file_size: 1000,
      created_at: new Date().toISOString()
    };

    const { data: inserted, error: insertError } = await supabase
      .from('documents')
      .insert([testDoc]);

    if (insertError) {
      console.log('Insert error:', insertError.message);
      console.log('Error code:', insertError.code);
    } else {
      console.log('Insert successful (test)');
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
}

checkRLS();
