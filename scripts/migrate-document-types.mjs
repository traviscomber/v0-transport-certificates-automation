#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import process from 'process'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function migrate() {
  try {
    console.log('🚀 Starting document type migration...')
    console.log('')

    // Step 1: Mark old types as inactive
    console.log('1️⃣  Marking old document types as inactive...')
    const { error: updateError, data: updateData } = await supabase
      .from('subcontractor_document_types')
      .update({ es_obligatorio: false })
      .in('code', ['AFP', 'SALUD', 'MUTUAL', 'SEGURO_SOCIAL'])
      .select()

    if (updateError) {
      console.error('❌ Error:', updateError)
      process.exit(1)
    }

    console.log(`✓ Marked ${updateData?.length || 0} old types as inactive`)
    console.log('')

    // Step 2: Insert new document types
    console.log('2️⃣  Adding new document types...')
    const { error: insertError, data: insertData } = await supabase
      .from('subcontractor_document_types')
      .upsert(
        [
          {
            code: 'PLANILLAS_IMPOSICIONES',
            nombre: 'Planillas de Imposiciones',
            descripcion: 'Planillas mensuales de imposiciones de los trabajadores',
            periodicidad: 'Mensual',
            es_obligatorio: true,
          },
          {
            code: 'PENSION',
            nombre: 'Pensión',
            descripcion: 'Comprobantes de pensión y/o jubilación',
            periodicidad: 'Mensual',
            es_obligatorio: true,
          },
        ],
        { onConflict: 'code' }
      )
      .select()

    if (insertError) {
      console.error('❌ Error:', insertError)
      process.exit(1)
    }

    console.log(`✓ Added ${insertData?.length || 0} new document types`)
    console.log('')

    // Step 3: Verify
    console.log('3️⃣  Verifying changes...')
    const { data: allTypes, error: verifyError } = await supabase
      .from('subcontractor_document_types')
      .select('code, nombre, es_obligatorio')
      .order('code')

    if (verifyError) {
      console.error('❌ Error verifying:', verifyError)
      process.exit(1)
    }

    console.log('')
    console.log('✅ Migration completed successfully!')
    console.log('')
    console.log('Document types in database:')
    allTypes?.forEach((type) => {
      const status = type.es_obligatorio ? '✓' : '✗'
      console.log(`  ${status} ${type.code}: ${type.nombre}`)
    })
    console.log('')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

migrate()
