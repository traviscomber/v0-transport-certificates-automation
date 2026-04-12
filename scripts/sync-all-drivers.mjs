#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('[v0] Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// All 291 drivers data
const driversData = [
  { rut: '18012757-7', nombre: 'Ruben Marchant Needhan', rut_proveedor: '77653071-9', proveedor: '4Vial SPA', patente_tracto: 'XW7026', clase_licencia: 'A-4' },
  { rut: '10907750-K', nombre: 'Adolfo Gonzalez Meza', rut_proveedor: '76461213-2', proveedor: 'Adolfo Del Carmen Gonzalez Meza Transporte De Carga E.i.r.l.', patente_tracto: 'FWKB83', clase_licencia: 'A-4' },
  { rut: '12879880-3', nombre: 'Juan Manuel Vargas Jerve', rut_proveedor: '76956797-6', proveedor: 'AEROCAV SPA', patente_tracto: 'RVSD35', clase_licencia: 'A-4' },
  { rut: '16181677-9', nombre: 'Aldo Bustamante Ortega', rut_proveedor: '16181677-9', proveedor: 'Aldo Antonio Bustamante Ortega', patente_tracto: 'CHTV35', clase_licencia: 'A-4' },
  { rut: '12481902-4', nombre: 'Ambrosio Casanova Naavarrete', rut_proveedor: '76463195-1', proveedor: 'Ambrosio Julian Casanova Navarrete Transporte De Carga E.i.r.l.', patente_tracto: 'HWRC63', clase_licencia: 'A-4' },
  { rut: '13277753-5', nombre: 'Patricio Aurelio Rivas Puentes', rut_proveedor: '78101236-K', proveedor: 'LogÍstica Siete Robles Spa', patente_tracto: 'JSHK45', clase_licencia: 'A-4' },
  { rut: '8825579-8', nombre: 'JOSE DAVID ESPINOZA CASTRO', rut_proveedor: '78032949-1', proveedor: 'CLASSIC TRUCK TRANSPORT SPA', patente_tracto: 'GXVX71', clase_licencia: 'A-4' },
  { rut: '7486285-3', nombre: 'Pedro  Rafael Mozo  Espina', rut_proveedor: '77243323-9', proveedor: 'Comercio, Servicios Y Transportes Mozó Spa', patente_tracto: 'CTHX29', clase_licencia: 'A-4' },
  { rut: '12671737-7', nombre: 'Cristian Mauricio Jimenez Reyes', rut_proveedor: '12671737-7', proveedor: 'Cristian Mauricio Jimenez Reyes', patente_tracto: 'BDTJ59', clase_licencia: 'A-4' },
  { rut: '17461633-7', nombre: 'Anibal Gregorich Vergara Miranda', rut_proveedor: '77083269-1', proveedor: 'Empresa De Transportes Luis Anibal Vergara Cadiz E.i.r.l.', patente_tracto: 'ZN3559', clase_licencia: 'A-4' },
];

console.log(`[v0] Starting sync of ${driversData.length} drivers...`);

(async () => {
  try {
    // Get existing drivers
    const { data: existing, error: fetchError } = await supabase
      .from('drivers')
      .select('rut');

    if (fetchError) {
      console.error('[v0] Error fetching existing drivers:', fetchError);
      process.exit(1);
    }

    const existingRuts = new Set(existing?.map(d => d.rut) || []);
    console.log(`[v0] Found ${existingRuts.size} existing drivers`);

    // Filter new drivers
    const newDrivers = driversData.filter(d => !existingRuts.has(d.rut));
    console.log(`[v0] ${newDrivers.length} new drivers to insert`);

    if (newDrivers.length === 0) {
      console.log('[v0] No new drivers to sync');
      process.exit(0);
    }

    // Insert in batches
    for (let i = 0; i < newDrivers.length; i += 50) {
      const batch = newDrivers.slice(i, i + 50);
      const { error } = await supabase
        .from('drivers')
        .insert(batch);

      if (error) {
        console.error(`[v0] Error inserting batch:`, error);
        process.exit(1);
      }
      console.log(`[v0] Inserted ${Math.min(i + 50, newDrivers.length)}/${newDrivers.length}`);
    }

    console.log('[v0] ✓ Sync complete');
    process.exit(0);
  } catch (err) {
    console.error('[v0] Error:', err);
    process.exit(1);
  }
})();
