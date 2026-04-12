import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { allSubcontractorsData } from '@/lib/data/all-subcontractors'
import { allDriversData } from '@/lib/data/all-drivers'

export async function POST() {
  try {
    const supabase = await createClient()

    console.log('[v0] Starting database seed...')

    // 1. Seed organizations (subcontratistas/transportistas)
    console.log('[v0] Seeding 221 organizations...')
    const organizations = allSubcontractorsData.map(sub => ({
      name: sub.nombre_fantasia || sub.nombre,
      rut: sub.rut
    }))

    const { error: orgError, data: orgData } = await supabase
      .from('organizations')
      .insert(organizations)
      .select('id, rut')

    if (orgError) {
      console.error('[v0] Error seeding organizations:', orgError)
      throw new Error(`Organizations error: ${orgError.message}`)
    }

    console.log(`[v0] ✓ Successfully seeded ${organizations.length} organizations`)

    // Create RUT to ID mapping
    const rutToOrgId = new Map((orgData || []).map(org => [org.rut, org.id]))
    console.log(`[v0] Created RUT mapping with ${rutToOrgId.size} organizations`)

    // 2. Seed drivers
    console.log('[v0] Seeding 291 drivers...')
    const drivers = allDriversData
      .map((driver, idx) => {
        // Assign driver to a subcontractor based on index
        const subIdx = idx % allSubcontractorsData.length
        const subRut = allSubcontractorsData[subIdx].rut
        const orgId = rutToOrgId.get(subRut)

        if (!orgId) {
          console.warn(`[v0] No organization found for driver ${driver.rut}, skipping`)
          return null
        }

        return {
          full_name: driver.nombre_completo,
          rut: driver.rut,
          email: `${driver.rut.replace(/\./g, '')}@transportes-labbe.cl`,
          phone: driver.telefono || '',
          license_number: driver.numero_licencia || `LIC-${driver.rut}`,
          license_type: 'Clase C',
          license_expiry: driver.vencimiento_licencia 
            ? new Date(driver.vencimiento_licencia).toISOString().split('T')[0]
            : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          organization_id: orgId
        }
      })
      .filter(Boolean)

    if (drivers.length === 0) {
      throw new Error('No valid drivers to seed')
    }

    console.log(`[v0] Prepared ${drivers.length} drivers for insertion`)

    const { error: driverError, data: driverData } = await supabase
      .from('drivers')
      .insert(drivers)
      .select('id')

    if (driverError) {
      console.error('[v0] Error seeding drivers:', driverError)
      throw new Error(`Drivers error: ${driverError.message}`)
    }

    console.log(`[v0] ✓ Successfully seeded ${drivers.length} drivers`)

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      stats: {
        organizations_created: organizations.length,
        drivers_created: drivers.length,
        total_records: organizations.length + drivers.length
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
