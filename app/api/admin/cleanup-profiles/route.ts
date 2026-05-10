import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const adminClient = createAdminClient()

    // Get all profiles that are NOT @labbe.cl
    const { data: nonLabbeProfiles } = await adminClient
      .from('profiles')
      .select('id, email, full_name, rut')
      .not('email', 'ilike', '%@labbe.cl%')
      .not('email', 'ilike', '%@labbe.cl%')

    console.log('[v0] Non-labbe profiles found:', nonLabbeProfiles?.length)

    return NextResponse.json({
      message: 'Profiles to delete',
      count: nonLabbeProfiles?.length || 0,
      profiles: nonLabbeProfiles || [],
    })
  } catch (err) {
    console.error('[v0] Error:', err)
    return NextResponse.json({ error: 'Error fetching profiles' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { action } = await request.json()
    const adminClient = createAdminClient()

    if (action === 'delete_non_labbe') {
      console.log('[v0] Deleting non-labbe profiles')
      
      // First, get the IDs of profiles to delete
      const { data: toDelete, error: fetchError } = await adminClient
        .from('profiles')
        .select('id')
        .not('email', 'ilike', '%@labbe.cl%')
        .not('email', 'ilike', '%@labbe.cl%')

      if (fetchError) {
        console.error('[v0] Error fetching profiles to delete:', fetchError)
        return NextResponse.json({ error: fetchError.message }, { status: 400 })
      }

      console.log('[v0] Found', toDelete?.length, 'profiles to delete')

      if (!toDelete || toDelete.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'No non-labbe profiles found',
          deleted: 0,
        })
      }

      // Delete each profile individually to avoid constraint issues
      let deletedCount = 0
      for (const profile of toDelete) {
        try {
          const { error: deleteError } = await adminClient
            .from('profiles')
            .delete()
            .eq('id', profile.id)

          if (deleteError) {
            console.warn('[v0] Could not delete profile', profile.id, ':', deleteError.message)
          } else {
            deletedCount++
          }
        } catch (err) {
          console.warn('[v0] Exception deleting profile:', err)
        }
      }

      // Get remaining profiles
      const { data: remaining } = await adminClient
        .from('profiles')
        .select('id, email, full_name')
        .order('full_name')

      console.log('[v0] Deleted', deletedCount, 'profiles. Remaining:', remaining?.length)

      return NextResponse.json({
        success: true,
        message: `Deleted ${deletedCount} non-labbe profiles`,
        deleted: deletedCount,
        remaining: remaining || [],
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err) {
    console.error('[v0] Error:', err)
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
