import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('[v0] Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Parse CSV function
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // Split by semicolon, handling quoted fields
    const fields = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ';' && !inQuotes) {
        fields.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    if (current) fields.push(current.trim());
    
    if (fields.length > 0) {
      rows.push(fields);
    }
  }
  
  return rows;
}

async function loadData() {
  console.log('[v0] Starting data load from CSV files...');
  
  try {
    // Load CSV 45 (subcontratistas)
    const csv45Path = '/vercel/share/v0-reference-workspace-sources/traviscomber/v0-transport-certificates-automation/main/user_read_only_context/text_attachments/45-wJS8A.csv';
    const csv44Path = '/vercel/share/v0-reference-workspace-sources/traviscomber/v0-transport-certificates-automation/main/user_read_only_context/text_attachments/44-OEuzp.csv';
    
    if (!fs.existsSync(csv45Path) || !fs.existsSync(csv44Path)) {
      console.log('[v0] CSV files not found at reference paths, trying local paths');
      // Try local paths
      const localCsv45 = 'user_read_only_context/text_attachments/45-wJS8A.csv';
      const localCsv44 = 'user_read_only_context/text_attachments/44-OEuzp.csv';
      
      if (!fs.existsSync(localCsv45) || !fs.existsSync(localCsv44)) {
        console.error('[v0] CSV files not found');
        process.exit(1);
      }
    }
    
    console.log('[v0] Parsing CSV 45 (subcontratistas)...');
    const subcontratistasData = parseCSV(csv45Path || 'user_read_only_context/text_attachments/45-wJS8A.csv');
    console.log('[v0] Found', subcontratistasData.length, 'subcontratistas');
    
    console.log('[v0] Parsing CSV 44 (conductores)...');
    const conductoresData = parseCSV(csv44Path || 'user_read_only_context/text_attachments/44-OEuzp.csv');
    console.log('[v0] Found', conductoresData.length, 'conductores');
    
    // Load subcontratistas to subcontratistas table
    console.log('[v0] Loading subcontratistas to database...');
    for (let i = 0; i < subcontratistasData.length; i += 50) {
      const batch = subcontratistasData.slice(i, i + 50);
      const rows = batch.map(fields => ({
        rut: fields[0]?.trim() || '',
        razon_social: fields[1]?.trim() || '',
        nombre_contacto: fields[2]?.trim() || '',
        direccion: fields[5]?.trim() || '',
        comuna: fields[6]?.trim() || '',
        telefono: fields[7]?.trim() || '',
        email: fields[8]?.trim() || '',
        ejecutiva: fields[9]?.trim() || 'N/A',
        ariztia: fields[10]?.toUpperCase() === 'ARIZTIA',
        lts: fields[11]?.toUpperCase() === 'LTS',
        rendic: fields[12]?.toUpperCase() === 'RENDIC',
        interpolar: fields[13]?.toUpperCase() === 'INTERPOLAR',
        is_active: true
      }));
      
      const { error } = await supabase
        .from('subcontratistas')
        .upsert(rows, { onConflict: 'rut' });
      
      if (error) {
        console.error('[v0] Error loading subcontratistas batch:', error);
      } else {
        console.log('[v0] Loaded subcontratistas batch', Math.floor(i/50) + 1);
      }
    }
    
    // Sync subcontratistas to transportistas
    console.log('[v0] Syncing to transportistas table...');
    const { data: allSubcontratistas } = await supabase
      .from('subcontratistas')
      .select('rut, razon_social, nombre_contacto, direccion, is_active');
    
    if (allSubcontratistas) {
      for (let i = 0; i < allSubcontratistas.length; i += 50) {
        const batch = allSubcontratistas.slice(i, i + 50);
        const rows = batch.map(s => ({
          rut: s.rut,
          razon_social: s.razon_social,
          nombre_fantasia: s.nombre_contacto,
          direccion: s.direccion,
          is_active: s.is_active
        }));
        
        const { error } = await supabase
          .from('transportistas')
          .upsert(rows, { onConflict: 'rut' });
        
        if (error) {
          console.error('[v0] Error syncing transportistas:', error);
        }
      }
    }
    
    // Get transportista RUT map for conductor linking
    const { data: transportistas } = await supabase
      .from('transportistas')
      .select('id, rut');
    
    const rutToId = new Map();
    if (transportistas) {
      transportistas.forEach(t => {
        rutToId.set(t.rut.toLowerCase(), t.id);
      });
    }
    
    console.log('[v0] Transportista RUT map size:', rutToId.size);
    
    // Load conductores
    console.log('[v0] Loading conductores to database...');
    let loadedCount = 0;
    
    for (let i = 0; i < conductoresData.length; i += 50) {
      const batch = conductoresData.slice(i, i + 50);
      const rows = batch.map(fields => {
        const rutProveedor = fields[0]?.trim().toLowerCase() || '';
        const transportistaId = rutToId.get(rutProveedor);
        
        return {
          rut: fields[3]?.trim() || '',
          nombres: fields[2]?.trim().split(' ').slice(0, -1).join(' ') || '',
          apellido_paterno: fields[2]?.trim().split(' ').pop() || '',
          rut_proveedor: fields[0]?.trim() || '',
          transportista_id: transportistaId || null,
          is_active: true
        };
      }).filter(r => r.rut && r.transportista_id); // Only include if we have valid data
      
      if (rows.length > 0) {
        const { data, error } = await supabase
          .from('conductores')
          .upsert(rows, { onConflict: 'rut' });
        
        if (error) {
          console.error('[v0] Error loading conductores batch:', error);
        } else {
          loadedCount += rows.length;
          console.log('[v0] Loaded conductores batch', Math.floor(i/50) + 1, '- Total:', loadedCount);
        }
      }
    }
    
    // Final verification
    const { count: subCount } = await supabase
      .from('subcontratistas')
      .select('*', { count: 'exact', head: true });
    
    const { count: transCount } = await supabase
      .from('transportistas')
      .select('*', { count: 'exact', head: true });
    
    const { count: condCount } = await supabase
      .from('conductores')
      .select('*', { count: 'exact', head: true });
    
    console.log('[v0] FINAL COUNTS:');
    console.log('[v0] Subcontratistas:', subCount);
    console.log('[v0] Transportistas:', transCount);
    console.log('[v0] Conductores:', condCount);
    
  } catch (error) {
    console.error('[v0] Error loading data:', error);
    process.exit(1);
  }
}

loadData();
