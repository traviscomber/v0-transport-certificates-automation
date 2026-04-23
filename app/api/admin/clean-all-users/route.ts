import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const adminClient = createAdminClient()

    console.log('[v0] Starting cleanup of all users')

    // Delete ALL profiles using a simple delete() call
    const { error: deleteError } = await adminClient
      .from('profiles')
      .delete()
      .gt('created_at', '1900-01-01') // Delete all where created_at > 1900 (everything)

    if (deleteError) {
      console.error('[v0] Delete error:', deleteError)
      // Continue anyway - try to verify what remains
    }

    // Verify deletion
    const { data: remaining, error: verifyError } = await adminClient
      .from('profiles')
      .select('id, email, full_name')

    console.log('[v0] Profiles remaining after cleanup:', remaining?.length || 0)

    if (verifyError) {
      console.error('[v0] Verify error:', verifyError)
    }

    return NextResponse.json({
      success: remaining?.length === 0,
      message: remaining?.length === 0 ? 'All users deleted successfully' : `Still have ${remaining?.length} users`,
      remaining: remaining?.length || 0,
    })
  } catch (error) {
    console.error('[v0] Cleanup error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error cleaning users' },
      { status: 500 }
    )
  }
}
