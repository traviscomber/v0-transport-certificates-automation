import { NextResponse } from 'next/server'
import { getConductorComplianceMetrics } from '@/lib/conductor-analytics'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    console.log('[v0] Fetching conductor compliance metrics...')
    const report = await getConductorComplianceMetrics()
    console.log('[v0] Fetched', report.conductors.length, 'conductors')
    console.log('[v0] First conductor:', report.conductors[0])
    console.log('[v0] Risk levels:', report.conductors.map(c => ({ name: c.conductorName, risk: c.riskLevel })))
    
    return NextResponse.json(report)
  } catch (error) {
    console.error('[v0] Error fetching compliance metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch compliance metrics' },
      { status: 500 }
    )
  }
}
