import subprocess
import sys
import os

# Read the drivers data file
drivers_file = '/vercel/share/v0-project/scripts/conductores-data.txt'

drivers = []
with open(drivers_file, 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if not line or line.startswith('Rut_Conductor'):
            continue
        
        parts = line.split('\t')
        if len(parts) >= 5:
            rut = parts[0].strip()
            nombre = parts[1].strip()
            rut_proveedor = parts[2].strip()
            proveedor = parts[3].strip()
            patente_tracto = parts[4].strip()
            
            # Infer license class (default A-4)
            clase_licencia = 'A-4'
            
            drivers.append({
                'rut': rut,
                'nombre': nombre,
                'rut_proveedor': rut_proveedor,
                'proveedor': proveedor,
                'patente_tracto': patente_tracto,
                'clase_licencia': clase_licencia
            })

print(f'[v0] Read {len(drivers)} drivers from file')

# Generate the insert_drivers.mjs file
script_content = '''import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('[v0] Error: Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const drivers = '''

# Add drivers as JSON
import json
drivers_json = json.dumps(drivers, ensure_ascii=False)
script_content += drivers_json + ';\n'

script_content += '''
async function syncDrivers() {
  try {
    console.log('[v0] Iniciando sincronización de conductores...');
    console.log(`[v0] Total conductores a sincronizar: ${drivers.length}`);

    // Get existing drivers to check for duplicates
    const { data: existingDrivers, error: fetchError } = await supabase
      .from('drivers')
      .select('rut');

    if (fetchError) throw fetchError;

    const existingRuts = new Set(existingDrivers?.map(d => d.rut) || []);
    console.log(`[v0] Conductores existentes: ${existingRuts.size}`);

    // Filter only new drivers
    const newDrivers = drivers.filter(d => !existingRuts.has(d.rut));
    console.log(`[v0] Conductores nuevos para insertar: ${newDrivers.length}`);

    if (newDrivers.length === 0) {
      console.log('[v0] No hay conductores nuevos para insertar');
      return;
    }

    // Insert in batches of 50
    const batchSize = 50;
    for (let i = 0; i < newDrivers.length; i += batchSize) {
      const batch = newDrivers.slice(i, i + batchSize);
      const { error } = await supabase
        .from('drivers')
        .insert(batch);

      if (error) throw error;
      console.log(`[v0] Lote ${Math.floor(i / batchSize) + 1} insertado: ${batch.length} conductores`);
    }

    console.log(`[v0] ✓ Sincronización completada. ${newDrivers.length} conductores insertados.`);
  } catch (error) {
    console.error('[v0] Error durante sincronización:', error);
    process.exit(1);
  }
}

syncDrivers();
'''

# Write the generated script
output_file = '/vercel/share/v0-project/scripts/insert_drivers.mjs'
with open(output_file, 'w', encoding='utf-8') as f:
    f.write(script_content)

print(f'[v0] Generated {output_file}')

# Now run the insert script
print('[v0] Ejecutando script de inserción...')
result = subprocess.run([sys.executable, '-m', 'pip', 'install', 'node'], capture_output=True)
result = subprocess.run(['node', output_file], capture_output=True, text=True)
print('[v0] STDOUT:', result.stdout)
if result.stderr:
    print('[v0] STDERR:', result.stderr)
