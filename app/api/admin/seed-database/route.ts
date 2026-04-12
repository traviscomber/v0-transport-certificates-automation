import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { allSubcontractorsData } from '@/lib/data/all-subcontractors'
import { allDriversData } from '@/lib/data/all-drivers'

export async function POST() {
  try {
    const supabase = await createClient()

    // 1. Seed organizations (subcontratistas/transportistas)
    console.log('[v0] Seeding organizations...')
    const organizations = allSubcontractorsData.map(sub => ({
      name: sub.nombre_fantasia || sub.nombre,
      rut: sub.rut,
      type: 'transportista' as const
    }))

    console.log('[v0] Inserting organizations payload:', organizations.slice(0, 2))
    
    const { error: orgError, data: orgData } = await supabase
      .from('organizations')
      .insert(organizations)
      .select()

    if (orgError) {
      console.error('[v0] Error seeding organizations:', orgError)
      throw new Error(`Organizations error: ${orgError.message}`)
    }

    console.log(`[v0] Seeded ${organizations.length} organizations`)

    // 2. Get organization IDs for driver assignments
    const { data: allOrgs, error: getOrgError } = await supabase
      .from('organizations')
      .select('id, rut')

    if (getOrgError) {
      throw new Error(`Get orgs error: ${getOrgError.message}`)
    }

    const rutToOrgId = new Map(allOrgs.map(org => [org.rut, org.id]))
    console.log(`[v0] Got ${allOrgs.length} organizations from DB`)

    // 3. Seed drivers
    console.log('[v0] Seeding drivers...')
    const drivers = allDriversData.map((driver, idx) => {
      const subRut = driver.rut_sub || allSubcontractorsData[idx % allSubcontractorsData.length]?.rut
      const orgId = rutToOrgId.get(subRut)

      if (!orgId) {
        console.warn(`[v0] No organization found for driver ${driver.rut}, using first org`)
        return null
      }

      return {
        full_name: driver.nombre_completo,
        rut: driver.rut,
        email: `${driver.rut.replace(/\./g, '')}@transportes-labbe.cl`,
        phone: driver.telefono || '',
        license_number: driver.numero_licencia || '',
        license_type: 'Clase C',
        license_expiry: driver.vencimiento_licencia ? new Date(driver.vencimiento_licencia).toISOString().split('T')[0] : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        organization_id: orgId
      }
    }).filter(Boolean)

    console.log('[v0] Inserting drivers payload:', drivers.slice(0, 2))

    const { error: driverError } = await supabase
      .from('drivers')
      .insert(drivers)
      .select()

    if (driverError) {
      console.error('[v0] Error seeding drivers:', driverError)
      throw new Error(`Drivers error: ${driverError.message}`)
    }

    console.log(`[v0] Seeded ${drivers.length} drivers`)

    // 4. Seed document types
    console.log('[v0] Seeding document types...')
    const documentTypes = [
      { code: 'LIC_CONDUCIR', name: 'Licencia de Conducir', category: 'conductor', validity_days: 365 },
      { code: 'REVISION_TECH', name: 'Revisión Técnica', category: 'vehiculo', validity_days: 365 },
      { code: 'SEGURO_INTEGRAL', name: 'Seguro Integral', category: 'vehiculo', validity_days: 365 },
      { code: 'CERT_ARIZTIA', name: 'Certificado Ariztia', category: 'empresa', validity_days: 365 },
      { code: 'F30', name: 'Formulario F30', category: 'empresa', validity_days: 365 },
      { code: 'ANTECEDENTES', name: 'Certificado Antecedentes', category: 'conductor', validity_days: 365 },
      { code: 'AFP', name: 'AFP', category: 'conductor', validity_days: 30 },
      { code: 'ISAPRE', name: 'ISAPRE', category: 'conductor', validity_days: 30 },
      { code: 'MUTUALIDAD', name: 'Mutualidad', category: 'conductor', validity_days: 30 },
      { code: 'LIQUIDACION', name: 'Liquidación de Sueldo', category: 'conductor', validity_days: 30 },
      { code: 'CERTIFICADO_LTS', name: 'Certificado LTS', category: 'empresa', validity_days: 365 },
      { code: 'AFILIACION_MUTUAL', name: 'Afiliación Mutual', category: 'conductor', validity_days: 365 }
    ]

    const { error: docTypeError } = await supabase
      .from('document_types')
      .insert(documentTypes)
      .select()

    if (docTypeError) {
      console.error('[v0] Error seeding document types:', docTypeError)
      throw new Error(`Document types error: ${docTypeError.message}`)
    }

    console.log(`[v0] Seeded ${documentTypes.length} document types`)

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      stats: {
        organizations: organizations.length,
        drivers: drivers.length,
        documentTypes: documentTypes.length
      }
    })
  } catch (error) {
    console.error('[v0] Seed database error:', error)
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
