import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminClient = await createAdminClient()
    const notificationId = params.id

    // Delete notification
    const { error } = await adminClient
      .from('notifications')
      .delete()
      .eq('id', notificationId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('[v0] Deleted notification:', notificationId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error deleting notification:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
