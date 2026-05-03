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
  
  // Parse with semicolon delimiter
  const parts = line.split(';').map(p => p.trim());
  
  if (parts.length >= 9) {
    records.push({
      rut: parts[0] || '',
      razon_social: parts[1] || '',
      nombre_contacto: parts[2] || '',
      ejecutiva: parts[4] || '',
      direccion: parts[5] || '',
      comuna: parts[6] || '',
      telefono: parts[7] || '',
      email: parts[8] || '',
      ariztia: (parts[9] || '').toLowerCase().includes('ariztia'),
      lts: (parts[10] || '').toLowerCase().includes('lts'),
      rendic: (parts[11] || '').toLowerCase().includes('rendic'),
      interpolar: (parts[12] || '').toLowerCase().includes('interpolar'),
    });
  }
}

console.log(`Total records parsed: ${records.length}`);
console.log('\n--- FIRST 5 RECORDS ---');
records.slice(0, 5).forEach((r, i) => {
  console.log(`${i + 1}. RUT: ${r.rut}, Empresa: ${r.razon_social}`);
});
