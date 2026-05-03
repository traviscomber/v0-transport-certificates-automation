#!/usr/bin/env node

/**
 * Setup script para crear la tabla companies y datos iniciales en Supabase
 * Uso: node scripts/setup-database.mjs
 */

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  try {
    console.log('🔧 Setting up companies table...')

    // Create companies table
    const { error: tableError } = await supabase.from('companies').select('*').limit(1)
    
    if (tableError?.code === 'PGRST116' || tableError?.code === '42P01') {
      console.log('📝 Creating companies table...')
      
      // We'll need to use SQL directly - this is a limitation
      console.log('⚠️  Table doesn\'t exist. Please create it manually via Supabase SQL Editor')
      console.log('Run the script in /vercel/share/v0-project/scripts/01-create-companies-table.sql')
      return false
    }

    console.log('✓ Companies table already exists')
    
    // Create Labbe admin account with hashed password
    const labbe Password = 'labbe2024!'
    const passwordHash = await bcrypt.hash(labbePassword, 10)

    const { data: existingLabbe } = await supabase
      .from('companies')
      .select('*')
      .eq('rut', '77266269-9')
      .single()

    if (!existingLabbe) {
      console.log('📝 Creating Transportes Labbe admin account...')
      
      const { error: insertError } = await supabase
        .from('companies')
        .insert({
          id: 'labbe-admin-001',
          rut: '77266269-9',
          name: 'Transportes Labbe',
          representative: 'Admin',
          email: 'admin@labbe.cl',
          phone: '+56912345678',
          address: 'Calle Transportes Labbe 123',
          region: 'Metropolitana',
          password_hash: passwordHash,
          is_labbe_admin: true,
        })

      if (insertError) throw insertError
      console.log('✓ Transportes Labbe admin account created')
      console.log(`  RUT: 77266269-9`)
      console.log(`  Contraseña temporal: ${labbePassword}`)
    } else {
      console.log('✓ Transportes Labbe admin account already exists')
    }

    console.log('\n✓ Database setup completed!')
    return true
  } catch (err) {
    console.error('❌ Setup error:', err instanceof Error ? err.message : err)
    return false
  }
}

// Run setup
setupDatabase().then(success => {
  process.exit(success ? 0 : 1)
})
