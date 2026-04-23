import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const adminClient = createAdminClient()

    console.log('[v0] Starting profiles table cleanup')

    // Delete ALL profiles from the table
    const { error: deleteError, count } = await adminClient
      .from('profiles')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete everything (using impossible condition)

    if (deleteError && deleteError.code !== 'PGRST116') {
      // PGRST116 means no rows matched, which is fine
      console.error('[v0] Error deleting profiles:', deleteError)
      throw deleteError
    }

    console.log('[v0] Profiles cleaned')

    // Verify deletion
    const { data: remaining, error: verifyError } = await adminClient
      .from('profiles')
      .select('id')

    if (verifyError) {
      console.error('[v0] Error verifying deletion:', verifyError)
      throw verifyError
    }

    console.log('[v0] Remaining profiles:', remaining?.length || 0)

    return NextResponse.json({
      success: true,
      message: 'All profiles deleted',
      remaining: remaining?.length || 0,
    })
  } catch (error) {
    console.error('[v0] Cleanup error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error cleaning profiles' },
      { status: 500 }
    )
  }
}
