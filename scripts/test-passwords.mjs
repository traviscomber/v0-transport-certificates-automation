import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const { data, error } = await supabase
  .from('conductor_auth')
  .select('rut, password_hash')
  .limit(3);

if (error) {
  console.error('Error:', error);
  process.exit(1);
}

console.log('Testing password formulas:\n');

for (const record of data) {
  const rut = record.rut;
  const hash = record.password_hash;
  
  const digits = rut.replace(/\D/g, '');
  const last4 = digits.slice(-4);
  const last2 = digits.slice(-2);
  const verifier = rut.split('-')[1];
  
  const formulas = [
    { label: 'labbe+last4', pwd: `labbe${last4}` },
    { label: 'labbe+last2', pwd: `labbe${last2}` },
    { label: 'labbe+verifier', pwd: `labbe${verifier}` },
  ];
  
  console.log(`RUT: ${rut}`);
  for (const f of formulas) {
    const match = await bcrypt.compare(f.pwd, hash);
    console.log(`  ${f.label}: ${f.pwd} → ${match ? '✅' : '❌'}`);
  }
  console.log();
}
