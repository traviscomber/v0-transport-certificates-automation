import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminClient = await createAdminClient()
    const notificationId = params.id

    // Mark notification as read
    const { error } = await adminClient
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('[v0] Marked notification as read:', notificationId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error marking notification as read:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
