import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Verify document types
const { data, error } = await supabase
  .from('subcontractor_document_types')
  .select('code, nombre, es_obligatorio')
  .order('code', { ascending: true });

if (error) {
  console.error('Error:', error);
} else {
  console.log('\n📋 Document Types Status in Database:\n');
  data.forEach(dt => {
    const status = dt.es_obligatorio ? '✓ ACTIVO  ' : '✗ INACTIVO';
    console.log(`${status}  ${dt.code.padEnd(25)} ${dt.nombre}`);
  });
  
  const active = data.filter(d => d.es_obligatorio).length;
  const inactive = data.filter(d => !d.es_obligatorio).length;
  
  console.log(`\n📊 Summary:`);
  console.log(`   Active types: ${active}`);
  console.log(`   Inactive types: ${inactive}`);
  console.log(`   Total: ${data.length}`);
  
  console.log(`\n✅ Migration Status:`);
  console.log(`   ✗ AFP - ${data.find(d => d.code === 'AFP')?.es_obligatorio ? 'ACTIVE' : 'INACTIVE'}`);
  console.log(`   ✗ SALUD - ${data.find(d => d.code === 'SALUD')?.es_obligatorio ? 'ACTIVE' : 'INACTIVE'}`);
  console.log(`   ✗ MUTUAL - ${data.find(d => d.code === 'MUTUAL')?.es_obligatorio ? 'ACTIVE' : 'INACTIVE'}`);
  console.log(`   ✗ SEGURO_SOCIAL - ${data.find(d => d.code === 'SEGURO_SOCIAL')?.es_obligatorio ? 'ACTIVE' : 'INACTIVE'}`);
  console.log(`   ✓ PLANILLAS_IMPOSICIONES - ${data.find(d => d.code === 'PLANILLAS_IMPOSICIONES')?.es_obligatorio ? 'ACTIVE' : 'INACTIVE'}`);
  console.log(`   ✓ PENSION - ${data.find(d => d.code === 'PENSION')?.es_obligatorio ? 'ACTIVE' : 'INACTIVE'}`);
}
