import fs from 'fs';
import path from 'path';

// Read CSV file
const csvPath = path.join(process.cwd(), 'scripts', 'subcontratistas.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.trim().split('\n');

// Parse CSV - skip header
const records = [];
for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  if (!line.trim()) continue;
  
  // Simple CSV parsing (assuming semicolon delimiter)
  const parts = line.split(';');
  
  if (parts.length >= 9) {
    const rut = parts[0]?.trim() || '';
    const razon_social = parts[1]?.trim() || '';
    const nombre_contacto = parts[2]?.trim() || '';
    const ejecutiva = parts[4]?.trim() || '';
    const direccion = parts[5]?.trim() || '';
    const comuna = parts[6]?.trim() || '';
    const telefono = parts[7]?.trim() || '';
    const email = parts[8]?.trim() || '';
    const ariztia = parts[9]?.includes('Ariztia') ? true : false;
    const lts = parts[10]?.includes('LTS') ? true : false;
    const rendic = parts[11]?.includes('Rendic') ? true : false;
    const interpolar = parts[12]?.includes('Interpolar') ? true : false;
    
    records.push({
      rut,
      razon_social,
      nombre_contacto,
      ejecutiva,
      direccion,
      comuna,
      region: 'RM', // Default region
      telefono,
      email,
      nombre_fantasia: '',
      ariztia,
      lts,
      rendic,
      interpolar,
      is_active: true
    });
  }
}

console.log(`Total records parsed: ${records.length}`);

// Generate SQL in batches of 30
const batchSize = 30;
let sqlOutput = '';

for (let batch = 0; batch < Math.ceil(records.length / batchSize); batch++) {
  const start = batch * batchSize;
  const end = Math.min(start + batchSize, records.length);
  const batchRecords = records.slice(start, end);
  
  sqlOutput += `\n-- Batch ${batch + 1} (Records ${start + 1}-${end})\n`;
  sqlOutput += `INSERT INTO subcontratistas (rut, razon_social, nombre_contacto, telefono, email, direccion, comuna, region, nombre_fantasia, ejecutiva, ariztia, lts, rendic, interpolar, is_active) VALUES\n`;
  
  const valueLines = batchRecords.map((r, idx) => {
    const values = [
      `'${r.rut.replace(/'/g, "''")}'`,
      `'${r.razon_social.replace(/'/g, "''")}'`,
      `'${r.nombre_contacto.replace(/'/g, "''")}'`,
      `'${r.telefono.replace(/'/g, "''")}'`,
      `'${r.email.replace(/'/g, "''")}'`,
      `'${r.direccion.replace(/'/g, "''")}'`,
      `'${r.comuna.replace(/'/g, "''")}'`,
      `'${r.region}'`,
      `'${r.nombre_fantasia}'`,
      `'${r.ejecutiva.replace(/'/g, "''")}'`,
      r.ariztia ? 'true' : 'false',
      r.lts ? 'true' : 'false',
      r.rendic ? 'true' : 'false',
      r.interpolar ? 'true' : 'false',
      'true'
    ];
    const line = `(${values.join(', ')})`;
    return idx < batchRecords.length - 1 ? line + ',' : line + ';';
  }).join('\n');
  
  sqlOutput += valueLines;
}

sqlOutput += '\n\nSELECT COUNT(*) as total FROM subcontratistas;';

// Write SQL to file
const sqlPath = path.join(process.cwd(), 'scripts', 'insert_real_data.sql');
fs.writeFileSync(sqlPath, sqlOutput);

console.log(`SQL file generated: ${sqlPath}`);
console.log(`Total batches: ${Math.ceil(records.length / batchSize)}`);
console.log(`First 3 records:`);
records.slice(0, 3).forEach((r, i) => {
  console.log(`${i + 1}. ${r.rut} - ${r.razon_social}`);
});
