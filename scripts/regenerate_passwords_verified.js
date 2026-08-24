#!/usr/bin/env node

/**
 * FIXED Script to regenerate bcrypt password hashes
 * This version verifies each hash works before saving
 */

const bcrypt = require('bcryptjs')
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

function getLast4BeforeVerifier(rut) {
  const digitsOnly = String(rut ?? '').replace(/[^0-9]/g, '')
  if (digitsOnly.length < 5) {
    throw new Error(`Invalid RUT: ${rut}`)
  }

  return digitsOnly.slice(0, -1).slice(-4)
}

async function regeneratePasswordsFixed() {
  console.log('[v0] Starting VERIFIED password hash regeneration...\n')

  try {
    // Get all transportistas
    const { data: transportistas, error: fetchError } = await supabase
      .from('transportistas')
      .select('id, rut')
      .eq('is_active', true)

    if (fetchError) {
      console.error('[v0] Error fetching transportistas:', fetchError)
      process.exit(1)
    }

    console.log(`[v0] Found ${transportistas.length} active transportistas\n`)

    let successCount = 0
    let errorCount = 0
    let verificationFailures = 0

    // Process in batches
    const batchSize = 50
    for (let i = 0; i < transportistas.length; i += batchSize) {
      const batch = transportistas.slice(i, i + batchSize)
      const batchNum = Math.floor(i / batchSize) + 1

      console.log(`[v0] Batch ${batchNum}: Generating and verifying hashes...`)

      // Generate AND VERIFY hashes for this batch
      const updates = []
      for (const t of batch) {
        const last4 = getLast4BeforeVerifier(t.rut)
        const password = `labbe${last4}`
        const passwordHash = await bcrypt.hash(password, 10)

        // VERIFY the hash works
        const verifies = await bcrypt.compare(password, passwordHash)
        if (!verifies) {
          console.error(`[v0] ❌ Verification failed for RUT: ${t.rut}`)
          verificationFailures++
          continue
        }

        updates.push({
          rut: t.rut,
          transportista_id: t.id,
          password_hash: passwordHash,
          is_active: true,
        })
      }

      if (updates.length === 0) {
        console.log(`[v0] ⚠️  Batch ${batchNum}: No valid hashes to save`)
        errorCount += batch.length
        continue
      }

      // Upsert into transportista_auth
      const { error: upsertError } = await supabase
        .from('transportista_auth')
        .upsert(updates, { onConflict: 'rut' })

      if (upsertError) {
        console.error(`[v0] ❌ Upsert error in batch ${batchNum}:`, upsertError.message)
        errorCount += batch.length
      } else {
        console.log(`[v0] ✅ Batch ${batchNum}: ${updates.length}/${batch.length} saved`)
        successCount += updates.length

        // Show sample for first batch without exposing generated credentials
        if (batchNum === 1) {
          console.log('[v0] Sample updates:')
          updates.slice(0, 2).forEach((u) => {
            console.log(`[v0]   RUT: ${u.rut} → credentials regenerated`)
          })
        }
      }
    }

    console.log('\n[v0] ='.repeat(30))
    console.log(`[v0] Total processed: ${transportistas.length}`)
    console.log(`[v0] Success: ${successCount}`)
    console.log(`[v0] Errors: ${errorCount}`)
    console.log(`[v0] Verification failures: ${verificationFailures}`)
    console.log('[v0] ='.repeat(30))
  } catch (error) {
    console.error('[v0] Unexpected error:', error.message)
    process.exit(1)
  }
}

regeneratePasswordsFixed()
