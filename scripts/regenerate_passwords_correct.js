const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function regeneratePasswords() {
  console.log('[v0] Starting password regeneration with correct digit extraction...');

  // Get all transportistas
  const { data: transportistas, error: fetchError } = await supabase
    .from('transportistas')
    .select('id, rut')
    .eq('is_active', true);

  if (fetchError || !transportistas) {
    console.error('[v0] Error fetching transportistas:', fetchError);
    return;
  }

  console.log(`[v0] Found ${transportistas.length} transportistas`);

  let successCount = 0;
  let errorCount = 0;
  const failedVerifications = [];

  for (const transportista of transportistas) {
    const rut = transportista.rut;
    
    // Extract only digits from RUT
    const digitsOnly = rut.replace(/[^0-9]/g, '');
    
    // Get the last 4 digits BEFORE the check digit
    // If RUT is "776530719" (9 digits), take digits 4-7 (0-indexed)
    const last4Digits = digitsOnly.slice(4, 8);
    const password = `labbe${last4Digits}`;

    console.log(`[v0] RUT: ${rut} → Digits: ${digitsOnly} → Last4: ${last4Digits} → Password: ${password}`);

    try {
      // Generate hash
      const passwordHash = await bcrypt.hash(password, 10);

      // Verify the hash works
      const matches = await bcrypt.compare(password, passwordHash);
      if (!matches) {
        console.warn(`[v0] ❌ Verification failed for ${rut}`);
        failedVerifications.push(rut);
        errorCount++;
        continue;
      }

      // Update in database
      const { error: updateError } = await supabase
        .from('transportista_auth')
        .upsert({
          rut: rut,
          transportista_id: transportista.id,
          password_hash: passwordHash,
          is_active: true,
        }, { onConflict: 'rut' });

      if (updateError) {
        console.error(`[v0] Error updating ${rut}:`, updateError);
        errorCount++;
      } else {
        successCount++;
        console.log(`[v0] ✅ Updated ${rut}`);
      }
    } catch (error) {
      console.error(`[v0] Exception for ${rut}:`, error.message);
      errorCount++;
    }
  }

  console.log('\n[v0] ========== REGENERATION COMPLETE ==========');
  console.log(`[v0] Total processed: ${transportistas.length}`);
  console.log(`[v0] Successful: ${successCount}`);
  console.log(`[v0] Errors: ${errorCount}`);
  if (failedVerifications.length > 0) {
    console.log(`[v0] Failed verifications: ${failedVerifications.join(', ')}`);
  }
  console.log('[v0] =============================================\n');
}

regeneratePasswords().catch(console.error);
