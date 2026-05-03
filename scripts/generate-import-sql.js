#!/usr/bin/env node

/**
 * Import Large Transport Company Dataset
 * This script parses TSV data and imports ~235+ companies into Supabase
 */

const fs = require('fs');
const path = require('path');

// Sample data generation for demonstration
function generateSQLInsert() {
  // Read the TSV file
  const filePath = path.join(__dirname, '../user_read_only_context/text_attachments/pasted-text-dP51A.txt');
  
  if (!fs.existsSync(filePath)) {
    console.error('Error: Data file not found');
    console.error('Expected at:', filePath);
    process.exit(1);
  }

  const data = fs.readFileSync(filePath, 'utf-8');
  const lines = data.split('\n').filter(line => line.trim());

  const companies = [];
  const passwordHash = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/1l.';

  // Skip header (line 0)
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split('\t');
    
    if (parts.length < 10) continue;

    const rut = parts[0]?.trim();
    const name = parts[1]?.trim();
    const representative = parts[2]?.trim();
    const address = parts[6]?.trim();
    const region = parts[7]?.trim();
    const phone = parts[8]?.trim();
    const email = parts[9]?.trim()?.toLowerCase();

    // Validate required fields
    if (!rut || !name || !email) continue;

    // Clean email (remove invalid characters)
    const cleanEmail = email.replace(/[^a-z0-9@.-]/g, '');
    
    if (!cleanEmail.includes('@')) continue;

    companies.push({
      id: `c-${rut}`,
      rut,
      name: name.substring(0, 255), // Database limit
      representative: representative || 'N/A',
      email: cleanEmail.substring(0, 255),
      phone: phone || '',
      address: address || '',
      region: region || 'Santiago',
      password_hash: passwordHash,
      is_labbe_admin: false,
    });
  }

  console.log(`Parsed ${companies.length} companies from dataset\n`);

  // Generate SQL in batches
  const sqlLines = [];
  sqlLines.push('-- Auto-generated import for large dataset (do not edit)');
  sqlLines.push('-- Total companies:', companies.length);
  sqlLines.push('');
  sqlLines.push('INSERT INTO public.companies (id, rut, name, representative, email, phone, address, region, password_hash, is_labbe_admin)');
  sqlLines.push('VALUES');

  // Group into batches of 50 for readability
  const batchSize = 50;
  for (let i = 0; i < companies.length; i++) {
    const company = companies[i];
    
    // Escape single quotes in strings
    const escapedName = company.name.replace(/'/g, "''");
    const escapedRep = company.representative.replace(/'/g, "''");
    const escapedEmail = company.email.replace(/'/g, "''");
    const escapedAddr = company.address.replace(/'/g, "''");
    const escapedRegion = company.region.replace(/'/g, "''");

    const valueLine = `('${company.id}', '${company.rut}', '${escapedName}', '${escapedRep}', '${escapedEmail}', '${company.phone}', '${escapedAddr}', '${escapedRegion}', '${company.password_hash}', ${company.is_labbe_admin ? 'true' : 'false'})`;
    
    if (i < companies.length - 1) {
      sqlLines.push(valueLine + ',');
    } else {
      sqlLines.push(valueLine);
    }

    // Add batch separator comment
    if ((i + 1) % batchSize === 0 && i < companies.length - 1) {
      sqlLines.push('');
      sqlLines.push('-- Batch ' + Math.floor(i / batchSize) + 1);
      sqlLines.push('');
    }
  }

  sqlLines.push('ON CONFLICT (rut) DO NOTHING;');

  const sql = sqlLines.join('\n');
  
  // Save to file
  const outputPath = path.join(__dirname, 'import-full-dataset.sql');
  fs.writeFileSync(outputPath, sql, 'utf-8');

  console.log(`✓ Generated SQL file: ${outputPath}`);
  console.log(`✓ Total companies to import: ${companies.length}`);
  console.log(`✓ SQL file size: ${(sql.length / 1024).toFixed(2)} KB`);
  console.log('');
  console.log('To import, execute this SQL in your Supabase console or use:');
  console.log('psql -h your-host -U your-user -d your-db -f import-full-dataset.sql');
}

generateSQLInsert();
