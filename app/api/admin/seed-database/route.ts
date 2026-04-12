import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { allSubcontractorsData } from '@/lib/data/all-subcontractors'
import { allDriversData } from '@/lib/data/all-drivers'

export async function POST() {
  let supabase
  
  try {
    supabase = await createClient()
    console.log('[v0] Supabase client created successfully')
  } catch (err) {
    console.error('[v0] Failed to create Supabase client:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to initialize Supabase client' },
      { status: 500 }
    )
  }

  try {
    // 1. Seed organizations
    console.log('[v0] Starting to seed organizations...')
    const organizations = allSubcontractorsData.map(sub => ({
      name: sub.nombre_fantasia || sub.nombre,
      rut: sub.rut
    }))

    console.log(`[v0] Prepared ${organizations.length} organizations`)

    const { error: orgError, data: orgData } = await supabase
      .from('organizations')
      .insert(organizations)
      .select('id, rut')

    if (orgError) {
      console.error('[v0] Organization insert error:', orgError)
      return NextResponse.json(
        { success: false, error: `Failed to insert organizations: ${orgError.message}` },
        { status: 500 }
      )
    }

    console.log(`[v0] Successfully inserted ${organizations.length} organizations`)

    // Create RUT to ID mapping
    const rutToOrgId = new Map((orgData || []).map(org => [org.rut, org.id]))
    console.log(`[v0] Created mapping for ${rutToOrgId.size} organizations`)

    // 2. Seed drivers
    console.log('[v0] Starting to seed drivers...')
    const drivers: any[] = []

    for (let i = 0; i < allDriversData.length; i++) {
      const driver = allDriversData[i]
      const subIdx = i % allSubcontractorsData.length
      const subRut = allSubcontractorsData[subIdx].rut
      const orgId = rutToOrgId.get(subRut)

      if (!orgId) {
        console.warn(`[v0] Skipping driver ${driver.rut} - no organization found`)
        continue
      }

      // Extract first and last name from full name
      const nameParts = (driver.nombre || '').trim().split(/\s+/)
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''

      drivers.push({
        rut: driver.rut,
        email: `${driver.rut.replace(/\./g, '').replace(/-/g, '')}@transportes-labbe.cl`,
        phone: '',
        first_name: firstName,
        last_name: lastName,
        organization_id: orgId
      })
    }

    console.log(`[v0] Prepared ${drivers.length} drivers for insertion`)

    if (drivers.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No drivers to seed' },
        { status: 400 }
      )
    }

    // Insert drivers in batches to avoid timeout
    const batchSize = 100
    let insertedDrivers = 0

    for (let i = 0; i < drivers.length; i += batchSize) {
      const batch = drivers.slice(i, i + batchSize)
      console.log(`[v0] Inserting driver batch ${Math.floor(i / batchSize) + 1}...`)

      const { error: driverError, data: driverData } = await supabase
        .from('drivers')
        .insert(batch)
        .select('id')

      if (driverError) {
        console.error('[v0] Driver batch insert error:', driverError)
        return NextResponse.json(
          { success: false, error: `Failed to insert drivers batch: ${driverError.message}` },
          { status: 500 }
        )
      }

      insertedDrivers += (driverData || []).length
      console.log(`[v0] Inserted ${insertedDrivers}/${drivers.length} drivers`)
    }

    console.log(`[v0] Successfully inserted all ${insertedDrivers} drivers`)

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      stats: {
        organizations_created: organizations.length,
        drivers_created: insertedDrivers,
        total_records: organizations.length + insertedDrivers
      }
    })
  } catch (error) {
    console.error('[v0] Unexpected error in seed:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
