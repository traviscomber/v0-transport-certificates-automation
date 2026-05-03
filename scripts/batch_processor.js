import fs from 'fs';

const csvFile = './subcontratistas.csv';
const lines = fs.readFileSync(csvFile, 'utf-8').split('\n');

// Parse CSV lines into batch SQL inserts
function parseCSVToSQL(lines, startLine = 1, batchSize = 30) {
  const batches = [];
  let currentBatch = [];
  
  for (let i = startLine; i < lines.length && i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = line.split(';');
    if (parts.length < 10) continue;
    
    const rut = parts[0] ? `'${parts[0].replace(/'/g, "''")}'` : "''";
    const razon_social = parts[1] ? `'${parts[1].replace(/'/g, "''")}'` : "''";
    const nombre_contacto = parts[2] ? `'${parts[2].replace(/'/g, "''")}'` : "''";
    const telefono = parts[7] ? `'${parts[7].replace(/'/g, "''")}'` : "''";
    const email = parts[8] ? `'${parts[8].replace(/'/g, "''")}'` : "''";
    const direccion = parts[5] ? `'${parts[5].replace(/'/g, "''")}'` : "''";
    const comuna = parts[6] ? `'${parts[6].replace(/'/g, "''")}'` : "''";
    const region = "'RM'";
    const nombre_fantasia = "''";
    const ejecutiva = parts[3] ? `'${parts[3].replace(/'/g, "''")}'` : "''";
    const ariztia = parts[9] && (parts[9].includes('Ariztia') || parts[9] === 'Ariztia') ? 'true' : 'false';
    const lts = parts[10] && (parts[10].includes('LTS') || parts[10] === 'LTS') ? 'true' : 'false';
    const rendic = parts[11] && (parts[11].includes('Rendic') || parts[11] === 'Rendic') ? 'true' : 'false';
    const interpolar = 'false';
    const is_active = 'true';
    
    const valueStr = `(${rut}, ${razon_social}, ${nombre_contacto}, ${telefono}, ${email}, ${direccion}, ${comuna}, ${region}, ${nombre_fantasia}, ${ejecutiva}, ${ariztia}, ${lts}, ${rendic}, ${interpolar}, ${is_active})`;
    currentBatch.push(valueStr);
    
    if (currentBatch.length === batchSize) {
      batches.push(currentBatch);
      currentBatch = [];
    }
  }
  
  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }
  
  return batches;
}

const batches = parseCSVToSQL(lines);
console.log(`Total batches: ${batches.length}`);
console.log(`Batch 1 SQL:`);
console.log(`INSERT INTO subcontratistas (rut, razon_social, nombre_contacto, telefono, email, direccion, comuna, region, nombre_fantasia, ejecutiva, ariztia, lts, rendic, interpolar, is_active) VALUES\n${batches[0].join(',\n')};`);
