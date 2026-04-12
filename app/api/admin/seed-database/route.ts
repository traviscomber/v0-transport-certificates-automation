import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { allSubcontractorsData } from '@/lib/data/all-subcontractors'
import { allDriversData } from '@/lib/data/all-drivers'

export async function POST() {
  let supabase
  
  try {
    supabase = await createClient()
  } catch (err) {
    return NextResponse.json(
      { success: false, error: 'Failed to initialize Supabase' },
      { status: 500 }
    )
  }

  try {
    // 1. Clear existing data (delete drivers first due to FK constraint)
    console.log('[v0] Clearing existing data...')
    
    const { error: deleteDriversError } = await supabase
      .from('drivers')
      .delete()
      .neq('id', '')
    
    if (deleteDriversError) {
      console.error('[v0] Error clearing drivers:', deleteDriversError)
    }

    const { error: deleteOrgsError } = await supabase
      .from('organizations')
      .delete()
      .neq('id', '')
    
    if (deleteOrgsError) {
      console.error('[v0] Error clearing organizations:', deleteOrgsError)
    }

    console.log('[v0] Cleared existing data')

    // 2. Seed fresh organizations
    console.log('[v0] Inserting 221 organizations...')
    const organizations = allSubcontractorsData.map(sub => ({
      name: sub.nombre_fantasia || sub.nombre,
      rut: sub.rut
    }))

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

    console.log(`[v0] ✓ Inserted ${organizations.length} organizations`)

    // Create RUT to ID mapping
    const rutToOrgId = new Map((orgData || []).map(org => [org.rut, org.id]))

    // 3. Seed fresh drivers
    console.log('[v0] Preparing 291 drivers...')
    const drivers: any[] = []

    for (let i = 0; i < allDriversData.length; i++) {
      const driver = allDriversData[i]
      const subIdx = i % allSubcontractorsData.length
      const subRut = allSubcontractorsData[subIdx].rut
      const orgId = rutToOrgId.get(subRut)

      if (!orgId) {
        continue
      }

      const nameParts = (driver.nombre || '').trim().split(/\s+/)
      const firstName = nameParts[0] || 'Unknown'
      const lastName = nameParts.slice(1).join(' ') || 'User'

      drivers.push({
        rut: driver.rut,
        email: `driver${i + 1}@transportes-labbe.cl`,
        phone: '',
        first_name: firstName,
        last_name: lastName,
        organization_id: orgId
      })
    }

    console.log(`[v0] Inserting ${drivers.length} drivers in batches...`)

    // Insert drivers in batches
    const batchSize = 50
    let insertedDrivers = 0

    for (let i = 0; i < drivers.length; i += batchSize) {
      const batch = drivers.slice(i, i + batchSize)
      
      const { error: driverError, data: driverData } = await supabase
        .from('drivers')
        .insert(batch)
        .select('id')

      if (driverError) {
        console.error(`[v0] Batch ${i / batchSize + 1} error:`, driverError)
        return NextResponse.json(
          { success: false, error: `Failed at batch: ${driverError.message}` },
          { status: 500 }
        )
      }

      insertedDrivers += (driverData || []).length
      console.log(`[v0] Progress: ${insertedDrivers}/${drivers.length} drivers inserted`)
    }

    console.log(`[v0] ✓ Inserted ${insertedDrivers} drivers`)

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully!',
      stats: {
        organizations: organizations.length,
        drivers: insertedDrivers,
        total: organizations.length + insertedDrivers
      }
    })
  } catch (error) {
    console.error('[v0] Unexpected error:', error)
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
