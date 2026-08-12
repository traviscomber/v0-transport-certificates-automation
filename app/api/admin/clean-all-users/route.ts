import { createAdminClient } from '@/lib/supabase/admin'
import { requireServerActor } from '@/lib/auth/server-actor'
import { NextResponse } from 'next/server'

export async function POST() {
  const auth = await requireServerActor(['admin'])
  if (!auth.actor) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const adminClient = createAdminClient()

    const { error: deleteError } = await adminClient
      .from('profiles')
      .delete()
      .gt('created_at', '1900-01-01')

    if (deleteError) {
      console.error('[admin] Delete error:', deleteError)
    }

    const { data: remaining, error: verifyError } = await adminClient
      .from('profiles')
      .select('id, email, full_name')

    if (verifyError) {
      console.error('[admin] Verify error:', verifyError)
    }

    return NextResponse.json({
      success: remaining?.length === 0,
      message: remaining?.length === 0 ? 'All users deleted successfully' : `Still have ${remaining?.length} users`,
      remaining: remaining?.length || 0,
    })
  } catch (error) {
    console.error('[admin] Cleanup error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error cleaning users' },
      { status: 500 }
    )
  }
}
