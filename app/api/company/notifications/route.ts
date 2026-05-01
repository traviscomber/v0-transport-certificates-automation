import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const adminClient = createAdminClient()

    // Get all notifications ordered by newest first
    const { data: notifications, error } = await adminClient
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('[v0] Error fetching notifications:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('[v0] Fetched', notifications?.length || 0, 'notifications')

    return NextResponse.json({ notifications: notifications || [] }, {
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
    })
  } catch (error) {
    console.error('[v0] Error in notifications GET:', error)
    return NextResponse.json({ error: 'Server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const adminClient = createAdminClient()
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const { error } = await adminClient
      .from('notifications')
      .delete()
      .eq('is_read', true)
      .lt('created_at', sevenDaysAgo)

    if (error) {
      console.error('[v0] Error cleaning notifications:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('[v0] Cleaned up old notifications')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error in notifications DELETE:', error)
    return NextResponse.json({ error: 'Server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
