import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminClient = createAdminClient()
    const { id } = params

    // Dismiss the alert instead of deleting it
    const { error } = await adminClient
      .from('alerts')
      .update({ is_dismissed: true, is_read: true })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error dismissing alert:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
