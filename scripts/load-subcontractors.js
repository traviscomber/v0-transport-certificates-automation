#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { allSubcontractorsData } from '../lib/data/all-subcontractors.ts'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('ERROR: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function loadSubcontractors() {
  console.log(`[v0] Loading ${allSubcontractorsData.length} subcontractors into Supabase...`)

  try {
    // First, delete existing transportistas to avoid duplicates
    console.log('[v0] Clearing existing transportistas...')
    const { error: deleteError } = await supabase
      .from('transportistas')
      .delete()
      .neq('id', null) // Delete all rows

    if (deleteError) {
      console.error('[v0] Error clearing transportistas:', deleteError)
    } else {
      console.log('[v0] Cleared existing transportistas')
    }

    // Transform and insert subcontractors
    const transportistas = allSubcontractorsData.map((sub) => ({
      rut: sub.rut,
      razon_social: sub.razon_social || sub.nombre,
      nombre_fantasia: sub.nombre_fantasia || '',
      direccion: sub.direccion || '',
      comuna: sub.comuna || '',
      region: sub.region || '',
      telefono: sub.telefono || '',
      email: sub.email || '',
      is_active: sub.is_active !== false,
      created_at: new Date().toISOString(),
    }))

    // Insert in batches to avoid timeouts
    const batchSize = 50
    let inserted = 0

    for (let i = 0; i < transportistas.length; i += batchSize) {
      const batch = transportistas.slice(i, i + batchSize)
      console.log(`[v0] Inserting batch ${Math.floor(i / batchSize) + 1} (${batch.length} records)...`)

      const { data, error } = await supabase
        .from('transportistas')
        .insert(batch)
        .select()

      if (error) {
        console.error(`[v0] Error inserting batch:`, error)
      } else {
        inserted += (data?.length || 0)
        console.log(`[v0] Inserted ${data?.length || 0} records (total: ${inserted})`)
      }
    }

    console.log(`[v0] SUCCESS: Loaded ${inserted} subcontractors into Supabase`)
    console.log(`[v0] Go to /admin/transportistas to see all ${inserted} transportistas`)
  } catch (error) {
    console.error('[v0] Error loading subcontractors:', error)
    process.exit(1)
  }
}

loadSubcontractors()
