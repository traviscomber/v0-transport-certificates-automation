#!/usr/bin/env node

/**
 * Script to regenerate bcrypt password hashes for all subcontractors
 * Run this locally: node scripts/regenerate_hashes.js
 */

const bcrypt = require('bcryptjs')
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function regeneratePasswords() {
  console.log('🔄 Starting password hash regeneration...\n')

  try {
    // Get all transportistas
    const { data: transportistas, error: fetchError } = await supabase
      .from('transportistas')
      .select('id, rut')
      .eq('is_active', true)

    if (fetchError) {
      console.error('❌ Error fetching transportistas:', fetchError)
      process.exit(1)
    }

    console.log(`Found ${transportistas.length} active transportistas\n`)

    let successCount = 0
    let errorCount = 0

    // Process in batches
    const batchSize = 50
    for (let i = 0; i < transportistas.length; i += batchSize) {
      const batch = transportistas.slice(i, i + batchSize)
      const batchNum = Math.floor(i / batchSize) + 1

      console.log(`\n📦 Processing batch ${batchNum}/${Math.ceil(transportistas.length / batchSize)}...`)

      // Generate hashes for this batch
      const updates = await Promise.all(
        batch.map(async (t) => {
          const last4 = t.rut.slice(-4).replace(/[^0-9]/g, '')
          const password = `labbe${last4}`
          const passwordHash = await bcrypt.hash(password, 10)

          return {
            rut: t.rut,
            password_hash: passwordHash,
          }
        })
      )

      // Upsert into transportista_auth
      const { error: upsertError } = await supabase
        .from('transportista_auth')
        .upsert(
          updates.map((u) => ({
            rut: u.rut,
            transportista_id: transportistas.find((t) => t.rut === u.rut)?.id,
            password_hash: u.password_hash,
            is_active: true,
          })),
          { onConflict: 'rut' }
        )

      if (upsertError) {
        console.error(`❌ Error in batch ${batchNum}:`, upsertError)
        errorCount += batch.length
      } else {
        console.log(`✅ Batch ${batchNum} completed: ${batch.length} records`)
        successCount += batch.length

        // Show sample for first batch
        if (batchNum === 1) {
          console.log('\n📋 Sample records created:')
          updates.slice(0, 3).forEach((u) => {
            console.log(`   RUT: ${u.rut} → Password: labbe${u.rut.slice(-4).replace(/[^0-9]/g, '')}`)
          })
        }
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('✅ Password regeneration complete!')
    console.log(`   Total: ${transportistas.length}`)
    console.log(`   Success: ${successCount}`)
    console.log(`   Errors: ${errorCount}`)
    console.log('='.repeat(60))

    console.log('\n🔐 All passwords are now:')
    console.log('   Format: labbe + last 4 digits of RUT')
    console.log('   Example: RUT 77653071-9 → Password labbe3071')
    console.log('\n✅ Subcontractors can now login at: https://cleaner2.vercel.app/subcontractors/login')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  }
}

regeneratePasswords()
