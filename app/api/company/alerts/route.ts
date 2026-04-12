import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()

    // Fetch all alerts from Supabase when that table exists
    // For now, return empty array - alerts will be generated from real data when needed
    const alerts: any[] = []

    return NextResponse.json({
      alerts,
      stats: {
        total: alerts.length,
        critical: alerts.filter(a => a.severity === 'critical').length,
        warning: alerts.filter(a => a.severity === 'warning').length,
        info: alerts.filter(a => a.severity === 'info').length,
      }
    })
  } catch (error) {
    console.error('[v0] Error fetching alerts:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to fetch alerts', details: errorMessage },
      { status: 500 }
    )
  }
}
