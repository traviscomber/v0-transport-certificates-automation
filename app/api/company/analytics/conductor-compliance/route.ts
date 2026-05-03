import { NextResponse } from 'next/server'
import { getConductorComplianceMetrics } from '@/lib/conductor-analytics'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const report = await getConductorComplianceMetrics()
    return NextResponse.json(report)
  } catch (error) {
    console.error('[v0] Error fetching compliance metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch compliance metrics' },
      { status: 500 }
    )
  }
}
