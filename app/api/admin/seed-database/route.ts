import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { allSubcontractorsData } from '@/lib/data/all-subcontractors'
import { allDriversData } from '@/lib/data/all-drivers'

export async function POST() {
  try {
    const supabase = createClient()

    // 1. Seed organizations (subcontratistas/transportistas)
    console.log('[v0] Seeding organizations...')
    const organizations = allSubcontractorsData.map(sub => ({
      name: sub.nombre_fantasia || sub.nombre,
      rut: sub.rut,
      type: 'transportista' as const,
      is_active: sub.is_active,
      compliance_score: sub.is_active ? 85 : 0
    }))

    const { error: orgError } = await supabase
      .from('organizations')
      .insert(organizations)

    if (orgError) {
      console.error('[v0] Error seeding organizations:', orgError)
      throw orgError
    }

    console.log(`[v0] Seeded ${organizations.length} organizations`)

    // 2. Get organization IDs for driver assignments
    const { data: orgData, error: getOrgError } = await supabase
      .from('organizations')
      .select('id, rut')

    if (getOrgError) throw getOrgError

    const rutToOrgId = new Map(orgData.map(org => [org.rut, org.id]))

    // 3. Seed drivers
    console.log('[v0] Seeding drivers...')
    const drivers = allDriversData.map(driver => {
      const subRut = driver.rut_sub || allSubcontractorsData[0]?.rut
      const orgId = rutToOrgId.get(subRut)

      return {
        full_name: driver.nombre_completo,
        rut: driver.rut,
        email: `${driver.rut}@transportes-labbe.cl`,
        phone: driver.telefono || '',
        license_number: driver.numero_licencia || '',
        license_type: 'Clase C',
        license_expiry: driver.vencimiento_licencia ? new Date(driver.vencimiento_licencia) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        organization_id: orgId,
        is_active: driver.estado !== 'inactivo',
        compliance_score: driver.estado !== 'inactivo' ? 80 : 0
      }
    })

    const { error: driverError } = await supabase
      .from('drivers')
      .insert(drivers)

    if (driverError) {
      console.error('[v0] Error seeding drivers:', driverError)
      throw driverError
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

    if (docTypeError) {
      console.error('[v0] Error seeding document types:', docTypeError)
      throw docTypeError
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}
