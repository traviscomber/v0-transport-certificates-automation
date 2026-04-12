import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Fetch events from audit_logs table when it exists
    // For now, return empty array - history will be populated from real events
    const events: any[] = []

    return NextResponse.json({
      events,
      pagination: {
        total: events.length,
        limit,
        offset,
        hasMore: offset + limit < events.length
      }
    })
  } catch (error) {
    console.error('[v0] Error fetching history:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to fetch history', details: errorMessage },
      { status: 500 }
    )
  }
}
