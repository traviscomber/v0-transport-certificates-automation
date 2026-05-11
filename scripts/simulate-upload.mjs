import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('[v0] === CONDUCTOR UPLOAD SIMULATION ===\n');

async function simulateUpload() {
  try {
    // Step 1: Get conductor
    console.log('[STEP 1] Looking up conductor from RUT 12.345.678-9...');
    const { data: conductor, error: conductorError } = await supabase
      .from('conductores')
      .select('*')
      .eq('rut', '12.345.678-9')
      .single();

    if (conductorError) {
      console.error('[ERROR] Not found. Finding first conductor...');
      const { data: first } = await supabase
        .from('conductores')
        .select('id, rut, nombres')
        .limit(1);
      
      if (first?.[0]) console.log('[INFO]', first[0]);
      return;
    }

    console.log('[✓] Found:', { id: conductor.id, rut: conductor.rut });

    // Step 2: Get document type
    console.log('\n[STEP 2] Looking up document type CEDULA_IDENTIDAD...');
    const docTypeId = '3803861c-5ff3-40ba-a6d7-de8245bc3cd2';
    const { data: docType, error: docTypeError } = await supabase
      .from('document_types')
      .select('*')
      .eq('id', docTypeId)
      .single();

    if (docTypeError) {
      console.error('[ERROR]', docTypeError.message);
      return;
    }

    console.log('[✓] Found:', { id: docType.id, name: docType.name });

    // Step 3: Insert document
    console.log('\n[STEP 3] Inserting document record...');
    const uploadRecord = {
      conductor_id: conductor.id,
      document_type_id: docType.id,
      original_filename: 'simulation_test.jpg',
      file_path: `conductores/${conductor.id}/test_${Date.now()}.jpg`,
      file_size: 357376,
      mime_type: 'image/jpeg',
      validation_status: 'pending'
    };

    const { data, error } = await supabase
      .from('uploaded_documents')
      .insert([uploadRecord])
      .select();

    if (error) {
      console.error('\n[✗] INSERT FAILED!');
      console.error('Error:', error.message);
      console.error('Code:', error.code);
      console.error('Details:', error.details);
      return;
    }

    console.log('[✓] Success! Record inserted:');
    console.log('   ID:', data[0].id);
    console.log('   Status:', data[0].validation_status);
    console.log('   Created:', data[0].created_at);

    console.log('\n════════════════════════════════════');
    console.log('✅ SIMULATION PASSED - Pipeline works!');
    console.log('════════════════════════════════════');

  } catch (error) {
    console.error('[FATAL ERROR]', error.message);
  }
}

simulateUpload().then(() => process.exit(0));
