const fs = require('fs');
const path = require('path');

// Read the file using absolute path
const filePath = '/vercel/share/v0-project/lib/data/all-drivers.ts';
let content = fs.readFileSync(filePath, 'utf-8');

// Replace all lines that don't have "documentos:" with version that includes empty documentos array
// Match pattern: { id: '...', ... is_active: true }
// Replace with: { id: '...', ... is_active: true, documentos: [] }

content = content.replace(
  /(\{ id: '[^']+', rut: '[^']+', nombres: '[^']+', apellido_paterno: '[^']+', apellido_materno: '[^']+', nombre: '[^']+', rut_proveedor: '[^']+', proveedor: '[^']+', patente_tracto: '[^']+', clase_licencia: '[^']+', is_active: (?:true|false))(\s*[},])/g,
  '$1, documentos: []$2'
);

// Write back
fs.writeFileSync(filePath, content, 'utf-8');
console.log('Updated all-drivers.ts with documentos arrays');
