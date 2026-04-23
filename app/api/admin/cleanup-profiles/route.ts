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
      .not('email', 'ilike', '%@transporteslabbe.cl%')

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
      // Delete all profiles that are NOT @labbe.cl
      const { error } = await adminClient
        .from('profiles')
        .delete()
        .not('email', 'ilike', '%@labbe.cl%')
        .not('email', 'ilike', '%@transporteslabbe.cl%')

      if (error) {
        console.error('[v0] Delete error:', error)
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      // Get remaining profiles
      const { data: remaining } = await adminClient
        .from('profiles')
        .select('id, email, full_name')
        .order('full_name')

      console.log('[v0] Deleted non-labbe profiles. Remaining:', remaining?.length)

      return NextResponse.json({
        success: true,
        message: 'Non-labbe profiles deleted',
        remaining: remaining || [],
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err) {
    console.error('[v0] Error:', err)
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
