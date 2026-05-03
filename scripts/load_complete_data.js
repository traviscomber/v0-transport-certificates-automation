import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('[v0] Missing Supabase credentials');
  process.exit(1);
}

// Parse CSV with semicolon separator
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  const header = lines[0].split(';');
  
  return lines.slice(1).map(line => {
    const values = line.split(';');
    const obj = {};
    header.forEach((key, i) => {
      obj[key.trim()] = values[i]?.trim() || '';
    });
    return obj;
  });
}

async function loadData() {
  try {
    console.log('[v0] Reading CSV files...');
    
    // Read CSV 45 (subcontratistas)
    const csv45Path = path.join(process.cwd(), 'user_read_only_context/text_attachments/45-wJS8A.csv');
    const subcontratistas = parseCSV(csv45Path);
    console.log(`[v0] Loaded ${subcontratistas.length} subcontratistas from CSV 45`);

    // Read CSV 44 (conductores)
    const csv44Path = path.join(process.cwd(), 'user_read_only_context/text_attachments/44-OEuzp.csv');
    const conductoresRaw = parseCSV(csv44Path);
    console.log(`[v0] Loaded ${conductoresRaw.length} conductores from CSV 44`);

    // Prepare INSERT for subcontratistas
    const subcontratistasValues = subcontratistas.map(row => [
      row['Rut_Proveedor'] || '',
      row['Proveedor'] || '',
      row['Representante Legal'] || '',
      row['Direccion'] || '',
      row['Comuna'] || '',
      row['Telefono'] || '',
      row['Correo'] || '',
      row['Ejecutiva'] || '',
      row['Ariztia'] ? 'true' : 'false',
      row['LTS'] ? 'true' : 'false',
      row['Rendic'] ? 'true' : 'false',
      row['Interpolar'] ? 'true' : 'false',
      'true'
    ]);

    const subcontratistasSQL = `
      INSERT INTO subcontratistas (rut, razon_social, nombre_contacto, direccion, comuna, telefono, email, ejecutiva, ariztia, lts, rendic, interpolar, is_active) 
      VALUES ${subcontratistasValues.map(v => `('${v[0]}', '${v[1].replace(/'/g, "''").substring(0,100)}', '${v[2].replace(/'/g, "''").substring(0,50)}', '${v[3].replace(/'/g, "''").substring(0,100)}', '${v[4].substring(0,50)}', '${v[5].substring(0,20)}', '${v[6].substring(0,100)}', '${v[7]}', ${v[8]}, ${v[9]}, ${v[10]}, ${v[11]}, ${v[12]})`).join(',')}
      ON CONFLICT (rut) DO NOTHING;
    `;

    // Sync to transportistas
    const syncSQL = `
      INSERT INTO transportistas (rut, razon_social, nombre_fantasia, direccion, is_active)
      SELECT rut, razon_social, nombre_contacto, direccion, is_active FROM subcontratistas
      ON CONFLICT (rut) DO NOTHING;
    `;

    // Prepare conductores data
    const conductoresMap = new Map();
    conductoresRaw.forEach(row => {
      const rutConductor = row['Rut R.L.']?.replace(/\s/g, '') || '';
      const nombres = (row['Representante Legal'] || '').split(' ');
      
      let apellidoPaterno = '';
      let nombres2 = '';
      
      if (nombres.length > 1) {
        apellidoPaterno = nombres[nombres.length - 1];
        nombres2 = nombres.slice(0, -1).join(' ');
      } else {
        nombres2 = nombres[0] || '';
      }
      
      conductoresMap.set(rutConductor, {
        rut: rutConductor,
        nombres: nombres2.substring(0, 100),
        apellido_paterno: apellidoPaterno.substring(0, 50),
        rut_proveedor: row['Rut_Proveedor'] || ''
      });
    });

    const conductoresValues = Array.from(conductoresMap.values());
    console.log(`[v0] Prepared ${conductoresValues.length} unique conductores`);

    const conductoresSQL = `
      INSERT INTO conductores (rut, nombres, apellido_paterno, rut_proveedor, transportista_id, is_active)
      SELECT 
        vals.conductor_rut,
        vals.nombres,
        vals.apellido_paterno,
        vals.rut_proveedor,
        t.id,
        true
      FROM (
        VALUES ${conductoresValues.map(v => `('${v.rut}', '${v.nombres.replace(/'/g, "''")}', '${v.apellido_paterno.replace(/'/g, "''")}', '${v.rut_proveedor}')`).join(',')}
      ) AS vals(conductor_rut, nombres, apellido_paterno, rut_proveedor)
      LEFT JOIN transportistas t ON t.rut = vals.rut_proveedor
      WHERE t.id IS NOT NULL
      ON CONFLICT (rut) DO NOTHING;
    `;

    // Execute queries
    console.log('[v0] Executing Supabase inserts...');

    const response1 = await fetch(`${supabaseUrl}/rest/v1/subcontratistas`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subcontratistasValues.map(v => ({
        rut: v[0],
        razon_social: v[1],
        nombre_contacto: v[2],
        direccion: v[3],
        comuna: v[4],
        telefono: v[5],
        email: v[6],
        ejecutiva: v[7],
        ariztia: v[8] === 'true',
        lts: v[9] === 'true',
        rendic: v[10] === 'true',
        interpolar: v[11] === 'true',
        is_active: true
      })))
    });

    if (!response1.ok) {
      console.error('[v0] Error loading subcontratistas:', await response1.text());
    } else {
      console.log('[v0] ✓ Subcontratistas loaded');
    }

    // Load conductores
    const response2 = await fetch(`${supabaseUrl}/rest/v1/conductores`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(conductoresValues.map(v => ({
        rut: v.rut,
        nombres: v.nombres,
        apellido_paterno: v.apellido_paterno,
        rut_proveedor: v.rut_proveedor,
        is_active: true
      })))
    });

    if (!response2.ok) {
      console.error('[v0] Error loading conductores:', await response2.text());
    } else {
      console.log('[v0] ✓ Conductores loaded');
    }

    console.log('[v0] Data loading complete!');

  } catch (error) {
    console.error('[v0] Error:', error.message);
    process.exit(1);
  }
}

loadData();
