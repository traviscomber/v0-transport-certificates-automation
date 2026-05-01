import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const adminClient = await createAdminClient()

    // Get current user
    const { data: { user } } = await adminClient.auth.admin.getUserById(
      request.headers.get('x-user-id') || ''
    )

    if (!user) {
      // For now, fetch all notifications (later filter by user)
      const { data: notifications, error } = await adminClient
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ notifications: notifications || [] }, {
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      })
    }

    // Get notifications for current user
    const { data: notifications, error } = await adminClient
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('[v0] Fetched', notifications?.length || 0, 'notifications for user:', user.id)

    return NextResponse.json({ notifications: notifications || [] }, {
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
    })
  } catch (error) {
    console.error('[v0] Error fetching notifications:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Delete all read notifications older than 7 days
    const adminClient = await createAdminClient()
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const { error } = await adminClient
      .from('notifications')
      .delete()
      .eq('read', true)
      .lt('created_at', sevenDaysAgo)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('[v0] Cleaned up old notifications')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error cleaning notifications:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
