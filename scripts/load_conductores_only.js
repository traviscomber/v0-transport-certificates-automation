import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('[v0] Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function loadConductores() {
  try {
    console.log('[v0] Reading CSV 44 (conductores)...');
    
    // Read CSV 44
    const csv44Path = '/vercel/share/v0-reference-workspace-sources/traviscomber/v0-transport-certificates-automation/main/44-OEuzp.csv';
    const csv44Content = fs.readFileSync(csv44Path, 'utf-8');
    const lines = csv44Content.split('\n').filter(line => line.trim());
    
    console.log(`[v0] CSV 44 has ${lines.length} total lines (including header)`);
    
    // Parse CSV - format: Rut_Proveedor;Proveedor;Representante Legal;Rut R.L.;...
    const conductores = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const parts = line.split(';').map(p => p.trim());
      if (parts.length < 4) continue;
      
      const rut_proveedor = parts[0];
      const conductor_rut = parts[3]; // Rut R.L.
      const full_name = parts[2]; // Representante Legal
      
      if (!conductor_rut || !full_name) continue;
      
      // Split full name into nombres and apellido_paterno
      const nameParts = full_name.split(' ');
      const apellido_paterno = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
      const nombres = nameParts.slice(0, -1).join(' ') || full_name;
      
      conductores.push({
        rut: conductor_rut,
        nombres: nombres,
        apellido_paterno: apellido_paterno,
        rut_proveedor: rut_proveedor,
      });
    }
    
    console.log(`[v0] Parsed ${conductores.length} conductores from CSV 44`);
    
    // Get all transportistas RUTs for lookup
    console.log('[v0] Fetching transportistas from database...');
    const { data: transportistas, error: transportistasError } = await supabase
      .from('transportistas')
      .select('id, rut');
    
    if (transportistasError) {
      throw transportistasError;
    }
    
    console.log(`[v0] Found ${transportistas?.length || 0} transportistas`);
    
    // Create RUT to ID map
    const rutToId = new Map();
    transportistas?.forEach(t => {
      rutToId.set(t.rut, t.id);
    });
    
    // Prepare conductores with transportista_id
    const conductoresToInsert = conductores
      .filter(c => {
        const transportista_id = rutToId.get(c.rut_proveedor);
        return transportista_id !== undefined;
      })
      .map(c => ({
        rut: c.rut,
        nombres: c.nombres,
        apellido_paterno: c.apellido_paterno,
        rut_proveedor: c.rut_proveedor,
        transportista_id: rutToId.get(c.rut_proveedor),
        is_active: true,
      }));
    
    console.log(`[v0] ${conductoresToInsert.length} conductores have matching transportistas`);
    
    // Insert in batches of 50
    const batchSize = 50;
    let inserted = 0;
    let skipped = 0;
    
    for (let i = 0; i < conductoresToInsert.length; i += batchSize) {
      const batch = conductoresToInsert.slice(i, i + batchSize);
      
      console.log(`[v0] Inserting batch ${Math.floor(i / batchSize) + 1} (${batch.length} records)...`);
      
      const { data, error, status } = await supabase
        .from('conductores')
        .upsert(batch, { onConflict: 'rut' });
      
      if (error) {
        console.error(`[v0] Error on batch ${Math.floor(i / batchSize) + 1}:`, error);
      } else {
        console.log(`[v0] Batch inserted/updated, status: ${status}`);
        inserted += batch.length;
      }
    }
    
    // Verify final count
    const { count, error: countError } = await supabase
      .from('conductores')
      .select('*', { count: 'exact', head: true });
    
    if (!countError) {
      console.log(`[v0] Final conductores count: ${count}`);
    }
    
    console.log('[v0] ✅ Conductores load complete!');
    
  } catch (error) {
    console.error('[v0] Error loading conductores:', error);
    process.exit(1);
  }
}

loadConductores();
