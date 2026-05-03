import fs from 'fs';
import path from 'path';

// Read the conductores.txt file
const filePath = '/vercel/share/v0-project/data/conductores.txt';
const content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split('\n').filter(line => line.trim());

// Skip header, process conductor records
const conductores = [];
const proveedorMap = {};

for (let i = 1; i < lines.length; i++) {
  const parts = lines[i].split('\t');
  if (parts.length < 4) continue;
  
  const rutConductor = parts[0].trim();
  const nombreConductor = parts[1].trim();
  const rutProveedor = parts[2].trim();
  const nombreProveedor = parts[3].trim();
  
  conductores.push({
    rut: rutConductor,
    nombre: nombreConductor,
    rutProveedor,
    nombreProveedor
  });
  
  if (!proveedorMap[rutProveedor]) {
    proveedorMap[rutProveedor] = nombreProveedor;
  }
}

console.log('Total conductores parsed:', conductores.length);
console.log('\nUnique Rut_Proveedor values:');
Object.entries(proveedorMap).forEach(([rut, nombre]) => {
  console.log(`  ${rut} - ${nombre}`);
});

// Create a mapping file for manual review
const mappingContent = JSON.stringify(proveedorMap, null, 2);
fs.writeFileSync('/vercel/share/v0-project/scripts/proveedor_mapping.json', mappingContent);
console.log('\nMapping file created: /vercel/share/v0-project/scripts/proveedor_mapping.json');

// Sample of conductores to show structure
console.log('\nFirst 5 conductores:');
conductores.slice(0, 5).forEach(c => {
  console.log(`  RUT: ${c.rut} | Proveedor RUT: ${c.rutProveedor} - ${c.nombreProveedor}`);
});
