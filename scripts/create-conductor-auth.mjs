import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const conductores = [
  { id: '688c31a4-073c-4f81-a0a1-bd60cb0f20c8', rut: '12.345.678-9', nombre: 'Juan Pérez' },
  { id: '69a49dda-8228-4832-acb7-3205e4f652b5', rut: '13.456.789-0', nombre: 'María González' },
  { id: '9c8e527a-60cd-400f-9de1-414afbebcb89', rut: '14.567.890-1', nombre: 'Carlos Rodríguez' }
];

async function createAuthRecords() {
  for (const conductor of conductores) {
    const rutDigits = conductor.rut.replace(/\D/g, '').slice(0, -1);
    const last4 = rutDigits.slice(-4);
    const password = `labbe${last4}`;
    
    const passwordHash = await bcrypt.hash(password, 10);
    
    console.log(`[v0] Creating auth for ${conductor.nombre}`);
    console.log(`[v0] RUT: ${conductor.rut} → Password: ${password}`);
    
    const { error } = await supabase
      .from('conductor_auth')
      .insert({
        conductor_id: conductor.id,
        rut: conductor.rut,
        password_hash: passwordHash,
        is_active: true,
        created_at: new Date().toISOString()
      });
    
    if (error) {
      console.error(`[v0] Error:`, error.message);
    } else {
      console.log(`[v0] SUCCESS\n`);
    }
  }
}

createAuthRecords().then(() => {
  console.log('[v0] All auth records created');
  process.exit(0);
}).catch(err => {
  console.error('[v0] Error:', err);
  process.exit(1);
});
