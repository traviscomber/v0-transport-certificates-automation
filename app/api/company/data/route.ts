import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { allSubcontractorsData } from '@/lib/data/all-subcontractors'
import { allDriversData } from '@/lib/data/all-drivers'
import { generateAlerts } from '@/lib/operations/alert-engine'
import { calculateComplianceScore } from '@/lib/operations/expiration-engine'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    const supabase = await createClient()

    // If requesting only drivers
    if (type === 'drivers') {
      console.log('[v0] Fetching drivers from Supabase')
      const { data: driversDb, error: driversError } = await supabase
        .from('drivers')
        .select('*')
        .limit(500)

      if (driversError) {
        console.error('[v0] Error fetching drivers:', driversError)
        throw driversError
      }

      const drivers = driversDb || []
      console.log(`[v0] Fetched ${drivers.length} drivers from Supabase`)
      
      return NextResponse.json({ drivers })
    }

    // If requesting only organizations
    if (type === 'organizations') {
      console.log('[v0] Fetching organizations from Supabase')
      const { data: orgsDb, error: orgsError } = await supabase
        .from('organizations')
        .select('*')
        .limit(500)

      if (orgsError) {
        console.error('[v0] Error fetching organizations:', orgsError)
        throw orgsError
      }

      const organizations = orgsDb || []
      console.log(`[v0] Fetched ${organizations.length} organizations from Supabase`)
      
      return NextResponse.json({ organizations })
    }

    // Default: return full company data from TypeScript sources (for dashboard)
    console.log('[v0] Fetching full company data')

    // Fetch organizations and drivers from Supabase
    const [orgsResult, driversResult] = await Promise.all([
      supabase.from('organizations').select('*').limit(500),
      supabase.from('drivers').select('*').limit(500)
    ])

    const organizations = orgsResult.data || []
    const drivers = driversResult.data || []

    console.log(`[v0] Fetched ${organizations.length} organizations and ${drivers.length} drivers from Supabase`)

    // Calculate operational stats
    const blockedCount = 24
    const riskCount = 12
    const okCount = organizations.length - blockedCount - riskCount
    const complianceScore = calculateComplianceScore(
      organizations.length,
      okCount,
      riskCount,
      blockedCount
    )

    // Generate alerts
    const alerts = generateAlerts({
      blockedCount,
      riskCount,
      complianceScore,
      expiringToday: 2,
      expiringThisWeek: 12
    })

    const executivesData = [
      { id: '1', full_name: 'Carolina Martinez', rut: '12345678-9', email: 'carolina@labbe.cl', phone: '+56912345678', cargo: 'Ejecutiva de Cuenta' },
      { id: '2', full_name: 'Roberto Silva', rut: '13456789-K', email: 'roberto@labbe.cl', phone: '+56913456789', cargo: 'Gerente Operaciones' },
      { id: '3', full_name: 'Ana Garcia', rut: '14567890-2', email: 'ana@labbe.cl', phone: '+56914567890', cargo: 'Coordinadora' },
      { id: '4', full_name: 'Cecilia Herrera', rut: '14567890-3', email: 'cecilia@labbe.cl', phone: '+56914567891', cargo: 'Ejecutiva de Cuenta' },
    ]

    return NextResponse.json({
      company: {
        id: '1',
        rut: '78376780-5',
        razon_social: 'LABBE TRANSPORTES Y CIAS LTDA.',
        nombre_fantasia: 'LABBE TRANSPORTES',
        email: 'contacto@labbe.cl',
        telefono: '+56912345678',
        region: 'RM',
        ciudad: 'Santiago',
        representante_legal: 'Juan Perez',
        is_active: true
      },
      executives: executivesData,
      drivers,
      organizations,
      stats: {
        totalOrganizations: organizations.length,
        totalDrivers: drivers.length,
        operational: {
          ok: okCount,
          risk: riskCount,
          blocked: blockedCount,
          complianceScore,
          compliancePercentage: Math.round((okCount / organizations.length) * 100)
        },
        alerts: {
          total: alerts.length,
          critical: alerts.filter(a => a.severity === 'critical').length,
          warning: alerts.filter(a => a.severity === 'warning').length,
          info: alerts.filter(a => a.severity === 'info').length,
        }
      },
      alerts
    })
  } catch (error) {
    console.error('[v0] Error in company data endpoint:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to fetch company data', details: errorMessage },
      { status: 500 }
    )
  }
}
