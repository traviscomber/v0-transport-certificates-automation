#!/usr/bin/env node
const fs = require('fs');

// Read CSV file
const csvPath = '/vercel/share/v0-project/scripts/subcontratistas.csv';
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Parse CSV manually
const lines = csvContent.trim().split('\n');
const headers = lines[0].split(';').map(h => h.trim());

// Helper functions
const escapeSql = (value) => {
  if (!value || value === '') return 'NULL';
  value = String(value).replace(/'/g, "''");
  return `'${value}'`;
};

const convertFlag = (value) => {
  if (value && String(value).toUpperCase().match(/ARIZTIA|LTS|RENDIC|INTERPOLAR|X|SI|S|1/)) {
    return 'true';
  }
  return 'false';
};

// Parse rows
const rows = [];
for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  if (!line.trim()) continue;
  
  const values = line.split(';');
  const row = {};
  
  headers.forEach((header, idx) => {
    row[header] = values[idx]?.trim() || '';
  });
  
  rows.push(row);
}

console.log(`-- Loading ${rows.length} subcontratistas from CSV`);
console.log('-- Total records to load:', rows.length);
console.log('');

// Generate SQL in batches of 30
const batchSize = 30;
for (let batchNum = 1; batchNum * batchSize <= rows.length + batchSize; batchNum++) {
  const start = (batchNum - 1) * batchSize;
  const end = Math.min(start + batchSize, rows.length);
  
  if (start >= rows.length) break;
  
  const batch = rows.slice(start, end);
  
  console.log(`-- Insert BATCH ${batchNum}: Subcontratistas ${start + 1}-${end}`);
  console.log('INSERT INTO subcontratistas (rut, razon_social, nombre_contacto, telefono, email, direccion, comuna, region, nombre_fantasia, ejecutiva, ariztia, lts, rendic, interpolar, is_active) VALUES');
  
  batch.forEach((row, idx) => {
    const values = [
      escapeSql(row['Rut_Proveedor']),
      escapeSql(row['Proveedor']),
      escapeSql(row['Representante Legal']),
      escapeSql(row['Telefono'] || '0'),
      escapeSql(row['Correo']),
      escapeSql(row['Direccion']),
      escapeSql(row['Comuna']),
      escapeSql('RM'),
      escapeSql(''),
      escapeSql(row['Ejecutiva']),
      convertFlag(row['Ariztia']),
      convertFlag(row['LTS']),
      convertFlag(row['Rendic']),
      convertFlag(row['Interpolar']),
      'true'
    ];
    
    const comma = idx < batch.length - 1 ? ',' : ';';
    console.log(`(${values.join(', ')})${comma}`);
  });
  
  console.log('');
}

console.log('SELECT COUNT(*) as total FROM subcontratistas;');
