const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('[v0] Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('[v0] Reading migration file...');
    const migrationPath = path.join(__dirname, '010_add_rejection_reason.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('[v0] Executing migration...');
    console.log('[v0] SQL:', sql);
    
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('[v0] Migration error:', error);
      process.exit(1);
    }
    
    console.log('[v0] Migration completed successfully');
    console.log('[v0] Result:', data);
  } catch (err) {
    console.error('[v0] Error running migration:', err);
    process.exit(1);
  }
}

runMigration();
