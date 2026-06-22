#!/usr/bin/env node

/**
 * Script to apply SQL migrations to Supabase
 * Usage: node scripts/apply-migration.js <migration-file>
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function applyMigration() {
  const migrationFile = process.argv[2] || '028_update_subcontractor_document_types.sql';
  const migrationPath = path.join(__dirname, migrationFile);

  if (!fs.existsSync(migrationPath)) {
    console.error(`Migration file not found: ${migrationPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(migrationPath, 'utf-8');

  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log(`Applying migration: ${migrationFile}`);
    console.log('---');

    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      console.error('Migration failed:', error);
      process.exit(1);
    }

    console.log('✓ Migration applied successfully');
    console.log('---');
    console.log('Document types updated:');
    console.log('- Removed: AFP, SALUD, MUTUAL, SEGURO_SOCIAL');
    console.log('- Added: PLANILLAS_IMPOSICIONES, PENSION');
  } catch (err) {
    console.error('Error applying migration:', err);
    process.exit(1);
  }
}

applyMigration();
