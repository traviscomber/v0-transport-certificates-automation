import { createAdminClient } from '@/lib/supabase/admin'
import { LABBE_SUBCONTRACTORS } from '@/app/api/company/subcontractors-data'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createAdminClient()

    // Get transportistas RUTs from DB
    const { data: transportistas } = await supabase
      .from('transportistas')
      .select('id, rut')
      .limit(10)

    // Get some subcontractors RUTs from data
    const subcontractorsRuts = LABBE_SUBCONTRACTORS.slice(0, 10).map(s => ({
      rut: s.rut,
      ejecutiva: s.ejecutiva,
    }))

    // Create normalized maps
    const transportistasNormalized = transportistas?.map(t => ({
      original: t.rut,
      normalized: t.rut?.toLowerCase().trim().replace(/\s/g, ''),
    })) || []

    const subcontractorsNormalized = subcontractorsRuts.map(s => ({
      original: s.rut,
      normalized: s.rut?.toLowerCase().trim().replace(/\s/g, ''),
      ejecutiva: s.ejecutiva,
    }))

    // Check for matches
    const matches = []
    for (const sub of subcontractorsNormalized) {
      const found = transportistasNormalized.find(t => t.normalized === sub.normalized)
      matches.push({
        subcontractor: sub,
        found: found ? 'YES' : 'NO',
        match: found,
      })
    }

    return NextResponse.json({
      transportistas_sample: transportistasNormalized,
      subcontractors_sample: subcontractorsNormalized,
      matching_results: matches,
      total_subcontractors: LABBE_SUBCONTRACTORS.length,
      total_transportistas: transportistas?.length || 0,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
