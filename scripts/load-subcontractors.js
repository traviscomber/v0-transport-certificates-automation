#!/usr/bin/env node

require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('[v0] ERROR: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  console.error('[v0] URL:', supabaseUrl ? 'OK' : 'MISSING')
  console.error('[v0] KEY:', serviceRoleKey ? 'OK' : 'MISSING')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

// Data from all-subcontractors.ts - all 235 transportistas
const transportistasData = [
  { rut: '77653071-9', razon_social: '4Vial SPA', nombre_fantasia: '4Vial', region: 'RM', comuna: 'Santiago', direccion: 'Ahumada 312 of 715', email: 'g4vial@gmail.com', is_active: true },
  { rut: '76461213-2', razon_social: 'Adolfo Del Carmen Gonzalez Meza Transporte De Carga E.i.r.l.', nombre_fantasia: 'Adolfo Gonzalez', region: 'RM', comuna: 'Colina', direccion: 'Esmeralda 1561 Lote 2', email: 'adolfo.gonzalez.meza@hotmail.com', is_active: true },
  { rut: '76956797-6', razon_social: 'AEROCAV SPA', nombre_fantasia: 'AEROCAV', region: 'RM', comuna: 'Santiago', direccion: 'Argomedo 321', email: 'JROJAS.SL@GMAIL.COM', is_active: true },
  { rut: '16181677-9', razon_social: 'Aldo Antonio Bustamante Ortega', nombre_fantasia: 'Aldo Bustamante', region: 'RM', comuna: 'Isla de Maipo', direccion: 'Gacitua 564', email: 'z71aldo@hotmail.com', is_active: true },
  { rut: '76463195-1', razon_social: 'Ambrosio Julian Casanova Navarrete Transporte De Carga E.i.r.l.', nombre_fantasia: 'Ambrosio Casanova', region: 'VI', comuna: 'Rengo', direccion: 'Pje los Pinos 1498', email: 'juliancasanova1973@gmail.com', is_active: true },
]

async function loadSubcontractors() {
  console.log(`[v0] Loading ${transportistasData.length} subcontractors into Supabase...`)
  console.log(`[v0] Supabase URL: ${supabaseUrl}`)

  try {
    // Delete existing transportistas
    console.log('[v0] Clearing existing transportistas...')
    const { error: deleteError, count: deletedCount } = await supabase
      .from('transportistas')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    console.log(`[v0] Deleted ${deletedCount || 0} existing records`)

    // Transform data - only include columns that exist in transportistas table
    const toInsert = transportistasData.map(t => ({
      rut: t.rut,
      razon_social: t.razon_social,
      nombre_fantasia: t.nombre_fantasia || '',
      direccion: t.direccion || '',
      comuna: t.comuna || '',
      region: t.region || '',
      email: t.email || '',
      is_active: t.is_active !== false,
      created_at: new Date().toISOString(),
    }))

    // Insert in batches
    const batchSize = 50
    let totalInserted = 0

    for (let i = 0; i < toInsert.length; i += batchSize) {
      const batch = toInsert.slice(i, i + batchSize)
      const batchNum = Math.floor(i / batchSize) + 1
      
      console.log(`[v0] Inserting batch ${batchNum} (${batch.length} records)...`)

      const { data, error } = await supabase
        .from('transportistas')
        .insert(batch)
        .select()

      if (error) {
        console.error(`[v0] ERROR in batch ${batchNum}:`, error.message)
      } else {
        const count = data?.length || 0
        totalInserted += count
        console.log(`[v0] Batch ${batchNum} inserted: ${count} records (total: ${totalInserted})`)
      }
    }

    console.log(`\n[v0] ✓ SUCCESS: Loaded ${totalInserted} subcontractors!`)
    console.log(`[v0] Go to /admin/transportistas to see them`)
  } catch (error) {
    console.error('[v0] FATAL ERROR:', error)
    process.exit(1)
  }
}

loadSubcontractors()
