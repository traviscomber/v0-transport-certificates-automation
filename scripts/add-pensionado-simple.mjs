import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔄 Adding es_pensionado field to conductores table...\n');

try {
  // First, let's check if the field already exists by trying to read it
  console.log('Checking if es_pensionado field already exists...');
  
  const { data: sample, error: checkError } = await supabase
    .from('conductores')
    .select('es_pensionado')
    .limit(1);

  if (!checkError) {
    console.log('✓ Field es_pensionado already exists!');
    console.log('✅ No migration needed - field is ready to use');
    process.exit(0);
  }

  // If we get here, the field doesn't exist
  // We need to add it using Supabase's SQL editor or direct query
  console.log('\n⚠️  Field does not exist yet.');
  console.log('You need to execute this SQL in Supabase SQL Editor:');
  console.log('\n' + '='.repeat(70));
  console.log(`
ALTER TABLE public.conductores
ADD COLUMN IF NOT EXISTS es_pensionado BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.conductores.es_pensionado IS 
'Indicates if the driver is pensioned/retired (true) or active working (false)';
  `.trim());
  console.log('='.repeat(70));
  console.log('\nSteps to execute:');
  console.log('1. Go to Supabase Dashboard');
  console.log('2. Select your project');
  console.log('3. Go to SQL Editor');
  console.log('4. Click "New Query"');
  console.log('5. Paste the SQL above');
  console.log('6. Click "Run"');
  
  process.exit(0);

} catch (err) {
  console.error('❌ Error:', err.message);
  process.exit(1);
}
