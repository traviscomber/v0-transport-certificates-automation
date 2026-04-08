import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Parse TSV data
function parseCompanies(data) {
  const lines = data.split('\n').filter(line => line.trim());
  const companies = [];

  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split('\t');
    if (parts.length < 9) continue;

    const rut = parts[0]?.trim();
    const name = parts[1]?.trim();
    const representative = parts[2]?.trim();
    const address = parts[6]?.trim();
    const region = parts[7]?.trim();
    const phone = parts[8]?.trim();
    const email = parts[9]?.trim();

    if (rut && name && email) {
      companies.push({
        id: `c-${rut}`,
        rut,
        name,
        representative: representative || 'N/A',
        email: email.toLowerCase(),
        phone: phone || '',
        address: address || '',
        region: region || 'Santiago',
        password_hash: '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/1l.',
        is_labbe_admin: false,
      });
    }
  }

  return companies;
}

async function importCompanies() {
  try {
    // Read the TSV file
    const filePath = path.join(process.cwd(), 'user_read_only_context', 'text_attachments', 'pasted-text-dP51A.txt');
    const data = fs.readFileSync(filePath, 'utf-8');

    const companies = parseCompanies(data);
    console.log(`Parsed ${companies.length} companies from dataset`);

    // Batch insert (Supabase has a limit per request)
    const batchSize = 100;
    let imported = 0;
    let skipped = 0;

    for (let i = 0; i < companies.length; i += batchSize) {
      const batch = companies.slice(i, i + batchSize);

      const { data: result, error } = await supabase
        .from('companies')
        .upsert(batch, { onConflict: 'rut' });

      if (error) {
        console.error(`Error importing batch ${i / batchSize + 1}:`, error);
        skipped += batch.length;
      } else {
        imported += batch.length;
        console.log(`Imported batch ${i / batchSize + 1}: ${batch.length} companies (Total: ${imported})`);
      }
    }

    // Get final count
    const { count, error: countError } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error getting count:', countError);
    } else {
      console.log(`\nFinal import complete!`);
      console.log(`Total companies in database: ${count}`);
      console.log(`Successfully imported: ${imported}`);
      console.log(`Skipped (duplicates): ${skipped}`);
    }
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
}

importCompanies();
