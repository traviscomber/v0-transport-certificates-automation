const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('[v0] Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Local driver data
const allDriversData = [
  {
    id: '266',
    rut: '12879880-3',
    nombres: 'Juan Manuel',
    apellido_paterno: 'Vargas',
    apellido_materno: 'Jerve',
    nombre: 'Juan Manuel Vargas Jerve',
    rut_proveedor: '76956797-6',
    proveedor: 'AEROCAV SPA',
    patente_tracto: 'RVS035',
    clase_licencia: 'A-4',
    is_active: true
  },
  {
    id: '267',
    rut: '16181677-9',
    nombres: 'Aldo Antonio',
    apellido_paterno: 'Bustamante',
    apellido_materno: 'Ortega',
    nombre: 'Aldo Bustamante Ortega',
    rut_proveedor: '16181677-9',
    proveedor: 'PROVEEDOR',
    patente_tracto: 'CITYX3',
    clase_licencia: 'A-4',
    is_active: true
  },
  {
    id: '282',
    rut: '13277753-5',
    nombres: 'Patricio Aurelio',
    apellido_paterno: 'Rivas',
    apellido_materno: 'Fuentes',
    nombre: 'Patricio Aurelio Rivas Fuentes',
    rut_proveedor: '78101236-1',
    proveedor: 'Logistica Siete Rivas',
    patente_tracto: 'LOGXXX',
    clase_licencia: 'A-4',
    is_active: true
  },
  {
    id: '290',
    rut: '13671737-7',
    nombres: 'Juan Carlos',
    apellido_paterno: 'Castro',
    apellido_materno: 'Flores',
    nombre: 'Juan Carlos Castro Flores',
    rut_proveedor: '78101236-1',
    proveedor: 'Logistica Siete Rivas',
    patente_tracto: 'LOGYYY',
    clase_licencia: 'A-4',
    is_active: true
  }
];

async function syncDriversToSupabase() {
  try {
    console.log('[v0] Starting driver sync to Supabase...');
    console.log(`[v0] Found ${allDriversData.length} drivers to sync`);

    // Prepare driver records for insertion
    const driversToInsert = allDriversData.map(driver => ({
      id: driver.id,
      rut: driver.rut,
      nombres: driver.nombres,
      apellido_paterno: driver.apellido_paterno,
      apellido_materno: driver.apellido_materno,
      nombre_completo: driver.nombre,
      rut_proveedor: driver.rut_proveedor,
      proveedor: driver.proveedor,
      patente_tracto: driver.patente_tracto,
      clase_licencia: driver.clase_licencia,
      is_active: driver.is_active,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    // Delete existing data
    console.log('[v0] Clearing existing conductores data...');
    const { error: deleteError } = await supabase
      .from('conductores')
      .delete()
      .neq('id', '');

    if (deleteError) {
      console.error('[v0] Error deleting existing data:', deleteError);
    } else {
      console.log('[v0] Existing data cleared');
    }

    // Insert drivers in batches
    const batchSize = 50;
    for (let i = 0; i < driversToInsert.length; i += batchSize) {
      const batch = driversToInsert.slice(i, i + batchSize);
      const { error, data } = await supabase
        .from('conductores')
        .insert(batch)
        .select();

      if (error) {
        console.error(`[v0] Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error);
      } else {
        console.log(`[v0] Batch ${Math.floor(i / batchSize) + 1} inserted: ${data?.length || 0} records`);
      }
    }

    // Verify the sync
    const { data: allConductores, error: fetchError } = await supabase
      .from('conductores')
      .select('id, rut, nombres');

    if (fetchError) {
      console.error('[v0] Error verifying sync:', fetchError);
    } else {
      console.log(`[v0] ✅ Sync complete! Total drivers in Supabase: ${allConductores?.length || 0}`);
      
      // Show sample
      if (allConductores && allConductores.length > 0) {
        console.log('[v0] Sample drivers:');
        allConductores.slice(0, 5).forEach(driver => {
          console.log(`  - ${driver.rut}: ${driver.nombres}`);
        });
      }
    }
  } catch (error) {
    console.error('[v0] Fatal error during sync:', error);
    process.exit(1);
  }
}

syncDriversToSupabase();
