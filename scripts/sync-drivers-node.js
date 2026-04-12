#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Read environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('[v0] Missing Supabase credentials');
  console.error('[v0] NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('[v0] SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Read drivers data from file
const dataFile = path.join(__dirname, 'conductores-data.txt');
const fileContent = fs.readFileSync(dataFile, 'utf-8');
const lines = fileContent.split('\n').filter(l => l.trim());

// Parse drivers (skip header)
const drivers = [];
for (let i = 1; i < lines.length; i++) {
  const parts = lines[i].split('\t');
  if (parts.length >= 5) {
    drivers.push({
      rut: parts[0].trim(),
      nombre: parts[1].trim(),
      rut_proveedor: parts[2].trim(),
      proveedor: parts[3].trim(),
      patente_tracto: parts[4].trim(),
      is_active: true
    });
  }
}

console.log(`[v0] Parsed ${drivers.length} drivers from file`);
console.log(`[v0] Syncing to Supabase...`);

(async () => {
  try {
    // Get existing drivers to avoid duplicates
    const { data: existing, error: fetchError } = await supabase
      .from('drivers')
      .select('rut');

    if (fetchError) {
      console.error('[v0] Error fetching existing drivers:', fetchError);
      process.exit(1);
    }

    const existingRuts = new Set(existing?.map(d => d.rut) || []);
    console.log(`[v0] Found ${existingRuts.size} existing drivers in database`);

    // Filter to only new drivers
    const newDrivers = drivers.filter(d => !existingRuts.has(d.rut));
    console.log(`[v0] ${newDrivers.length} new drivers to insert`);

    if (newDrivers.length === 0) {
      console.log('[v0] No new drivers to insert');
      process.exit(0);
    }

    // Insert in batches of 50
    let inserted = 0;
    for (let i = 0; i < newDrivers.length; i += 50) {
      const batch = newDrivers.slice(i, i + 50);
      const { error } = await supabase
        .from('drivers')
        .insert(batch);

      if (error) {
        console.error(`[v0] Error inserting batch ${Math.floor(i/50)+1}:`, error);
        process.exit(1);
      }
      inserted += batch.length;
      console.log(`[v0] Inserted ${inserted}/${newDrivers.length} drivers`);
    }

    console.log(`[v0] ✓ Successfully synced ${inserted} drivers to Supabase`);
    process.exit(0);
  } catch (err) {
    console.error('[v0] Error:', err);
    process.exit(1);
  }
})();
