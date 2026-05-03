const fs = require('fs');
const path = require('path');

// Read CSV file
const csvFile = path.join(__dirname, 'subcontratistas.csv');
const csvContent = fs.readFileSync(csvFile, 'utf-8');
const lines = csvContent.split('\n');

// Parse header
const header = lines[0].split(';').map(h => h.trim());
const indices = {
  rut: header.indexOf('Rut_Proveedor'),
  nombre: header.indexOf('Proveedor'),
  representante: header.indexOf('Representante Legal'),
  ejecutiva: header.indexOf('Ejecutiva'),
  direccion: header.indexOf('Direccion'),
  comuna: header.indexOf('Comuna'),
  telefono: header.indexOf('Telefono'),
  correo: header.indexOf('Correo'),
};

console.log('-- SQL Updates for 229 transportistas');
console.log('-- Generated from subcontratistas.csv');
console.log('');

let count = 0;

// Process each line
for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  
  const parts = line.split(';');
  const rut = parts[indices.rut]?.trim();
  const nombre = parts[indices.nombre]?.trim().replace(/'/g, "''") || '';
  const representante = parts[indices.representante]?.trim().replace(/'/g, "''") || '';
  const ejecutiva = parts[indices.ejecutiva]?.trim().replace(/'/g, "''") || '';
  const direccion = parts[indices.direccion]?.trim().replace(/'/g, "''") || '';
  const comuna = parts[indices.comuna]?.trim().replace(/'/g, "''") || '';
  const telefono = parts[indices.telefono]?.trim().replace(/'/g, "''") || '';
  const correo = parts[indices.correo]?.trim().replace(/'/g, "''") || '';
  
  if (!rut) continue;
  
  console.log(`UPDATE transportistas SET razon_social = '${nombre}', representante_legal = '${representante}', ejecutivo_nombre = '${ejecutiva}', direccion = '${direccion}', comuna = '${comuna}', telefono = '${telefono}', correo = '${correo}' WHERE rut = '${rut}';`);
  
  count++;
}

console.log('');
console.log(`-- Total: ${count} updates`);
