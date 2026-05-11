import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetAllPasswords() {
  try {
    // Get all active conductores
    const { data: conductores, error: conductoresError } = await supabase
      .from('conductores')
      .select('id, rut, nombres, apellido_paterno')
      .eq('is_active', true);

    if (conductoresError) {
      console.error('[v0] Error fetching conductores:', conductoresError);
      process.exit(1);
    }

    console.log(`[v0] Resetting passwords for ${conductores.length} conductores\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const conductor of conductores) {
      const rutDigits = conductor.rut.replace(/\D/g, '').slice(0, -1);
      const last4 = rutDigits.slice(-4);
      const password = `labbe${last4}`;
      const passwordHash = await bcrypt.hash(password, 10);

      // Check if auth record exists
      const { data: existingAuth } = await supabase
        .from('conductor_auth')
        .select('id')
        .eq('rut', conductor.rut)
        .single();

      let result;

      if (existingAuth) {
        // Update existing record
        result = await supabase
          .from('conductor_auth')
          .update({
            password_hash: passwordHash,
            is_active: true,
          })
          .eq('rut', conductor.rut);
      } else {
        // Create new record
        result = await supabase
          .from('conductor_auth')
          .insert({
            conductor_id: conductor.id,
            rut: conductor.rut,
            password_hash: passwordHash,
            is_active: true,
            created_at: new Date().toISOString(),
          });
      }

      if (result.error) {
        console.error(`[v0] ❌ ${conductor.rut}: ${result.error.message}`);
        errorCount++;
      } else {
        console.log(`[v0] ✅ ${conductor.rut}: ${password}`);
        successCount++;
      }
    }

    console.log(`\n[v0] Completed: ${successCount} successful, ${errorCount} errors`);
    process.exit(errorCount > 0 ? 1 : 0);
  } catch (error) {
    console.error('[v0] Fatal error:', error);
    process.exit(1);
  }
}

resetAllPasswords();
