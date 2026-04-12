import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    const supabase = await createClient()

    // If requesting only drivers
    if (type === 'drivers') {
      const { data: driversDb, error: driversError } = await supabase
        .from('drivers')
        .select('*')
        .limit(500)

      if (driversError) throw driversError
      return NextResponse.json({ drivers: driversDb || [] })
    }

    // If requesting only organizations
    if (type === 'organizations') {
      const { data: orgsDb, error: orgsError } = await supabase
        .from('organizations')
        .select('*')
        .limit(500)

      if (orgsError) throw orgsError
      return NextResponse.json({ organizations: orgsDb || [] })
    }

    // Default: return full company data - ALL from Supabase
    const [orgsResult, driversResult] = await Promise.all([
      supabase.from('organizations').select('*').limit(500),
      supabase.from('drivers').select('*').limit(500)
    ])

    const organizations = orgsResult.data || []
    const drivers = driversResult.data || []

    return NextResponse.json({
      drivers,
      organizations,
      stats: {
        totalOrganizations: organizations.length,
        totalDrivers: drivers.length
      }
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
