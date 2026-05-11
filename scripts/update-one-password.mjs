import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const rut = '11048573-3';
const password = 'labbe8573';

console.log('Manually updating password for RUT:', rut);
console.log('Password:', password);

// Hash the password
const salt = await bcrypt.genSalt(10);
const passwordHash = await bcrypt.hash(password, salt);

console.log('Generated hash:', passwordHash);

// Update in database
const { data, error } = await supabase
  .from('conductor_auth')
  .update({ password_hash: passwordHash })
  .eq('rut', rut)
  .select();

if (error) {
  console.error('Update error:', error);
  process.exit(1);
}

console.log('Updated record:', data[0].rut);
console.log('✅ Password successfully updated!');

// Verify it works
const verify = await bcrypt.compare(password, data[0].password_hash);
console.log('Verification:', verify ? '✅ MATCH' : '❌ NO MATCH');
