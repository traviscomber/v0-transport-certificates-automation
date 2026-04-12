import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { allSubcontractorsData } from '@/lib/data/all-subcontractors'
import { allDriversData } from '@/lib/data/all-drivers'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const supabase = await createClient()

    console.log('[v0] Starting real data seeding...')
    console.log('[v0] Subcontractors:', allSubcontractorsData.length)
    console.log('[v0] Drivers:', allDriversData.length)

    // 1. Delete existing data
    console.log('[v0] Deleting existing data...')
    await supabase.from('drivers').delete().gte('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('organizations').delete().gte('id', '00000000-0000-0000-0000-000000000000')

    // 2. Insert organizations
    console.log('[v0] Inserting organizations...')
    const organizations = allSubcontractorsData.map(org => ({
      name: org.nombre || org.nombre_fantasia || org.razon_social,
      rut: org.rut
      // Note: type field omitted to avoid schema cache issues - will use DEFAULT 'transportista'
    }))

    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .insert(organizations)
      .select('id, rut')

    if (orgError) {
      console.error('[v0] Organization insert error:', orgError)
      throw new Error(`Failed to insert organizations: ${orgError.message}`)
    }

    console.log(`[v0] ✓ Inserted ${organizations.length} organizations`)

    // Create RUT to ID mapping
    const rutToOrgId = new Map((orgData || []).map(org => [org.rut, org.id]))

    // 3. Insert drivers in batches
    console.log('[v0] Preparing drivers data...')
    const drivers = allDriversData
      .map((driver, idx) => {
        const subIdx = idx % allSubcontractorsData.length
        const subRut = allSubcontractorsData[subIdx].rut
        const orgId = rutToOrgId.get(subRut)

        if (!orgId) {
          console.warn(`[v0] No org found for driver ${driver.rut}`)
          return null
        }

        const firstName = driver.nombres || ''
        const lastName = [driver.apellido_paterno, driver.apellido_materno]
          .filter(Boolean)
          .join(' ')
          .trim()

        return {
          organization_id: orgId,
          rut: driver.rut,
          email: `${driver.rut.replace(/\./g, '').replace(/-/g, '')}@transportes-labbe.cl`,
          phone: '',
          first_name: firstName,
          last_name: lastName
        }
      })
      .filter(Boolean)

    console.log(`[v0] Prepared ${drivers.length} drivers`)

    // Insert in batches of 50
    const batchSize = 50
    let insertedCount = 0

    for (let i = 0; i < drivers.length; i += batchSize) {
      const batch = drivers.slice(i, i + batchSize)
      console.log(`[v0] Inserting driver batch ${Math.floor(i / batchSize) + 1}...`)

      const { error: driverError, data: driverData } = await supabase
        .from('drivers')
        .insert(batch)
        .select('id')

      if (driverError) {
        console.error(`[v0] Driver batch error:`, driverError)
        throw new Error(`Failed to insert drivers batch: ${driverError.message}`)
      }

      insertedCount += (driverData || []).length
      console.log(`[v0] Batch complete. Total inserted: ${insertedCount}/${drivers.length}`)
    }

    console.log(`[v0] ✓ Successfully inserted all ${insertedCount} drivers`)

    return NextResponse.json({
      success: true,
      message: 'Real data seeded successfully',
      stats: {
        organizations_created: organizations.length,
        drivers_created: insertedCount,
        total_records: organizations.length + insertedCount
      }
    })
  } catch (error) {
    console.error('[v0] Seed error:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      {
        success: false,
        error: errorMessage
      },
      { status: 500 }
    )
  }
}
