import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const adminClient = createAdminClient()

    console.log('[v0] Starting full cleanup of users')

    // Step 1: Get all profile IDs
    const { data: profiles, error: fetchError } = await adminClient
      .from('profiles')
      .select('id')

    if (fetchError) {
      console.error('[v0] Error fetching profiles:', fetchError)
      throw fetchError
    }

    console.log('[v0] Found', profiles?.length || 0, 'profiles to delete')

    // Step 2: Delete auth users first (which should cascade to profiles)
    let deletedAuthCount = 0
    if (profiles && profiles.length > 0) {
      for (const profile of profiles) {
        try {
          await adminClient.auth.admin.deleteUser(profile.id)
          deletedAuthCount++
          console.log('[v0] Deleted auth user:', profile.id)
        } catch (err) {
          console.warn('[v0] Could not delete auth user:', profile.id, err)
          // Continue - auth user might not exist
        }
      }
    }

    console.log('[v0] Deleted', deletedAuthCount, 'auth users')

    // Step 3: Delete any remaining profiles
    const { error: deleteError } = await adminClient
      .from('profiles')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete everything

    if (deleteError && deleteError.code !== 'PGRST116') {
      console.error('[v0] Error deleting profiles:', deleteError)
      throw deleteError
    }

    console.log('[v0] Profiles deleted')

    // Step 4: Verify cleanup
    const { data: remaining, error: verifyError } = await adminClient
      .from('profiles')
      .select('id')

    if (verifyError) {
      console.error('[v0] Error verifying deletion:', verifyError)
      throw verifyError
    }

    console.log('[v0] Cleanup complete. Remaining profiles:', remaining?.length || 0)

    return NextResponse.json({
      success: true,
      message: 'All users cleaned',
      deletedAuthUsers: deletedAuthCount,
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
