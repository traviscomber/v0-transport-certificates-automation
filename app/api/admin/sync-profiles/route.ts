import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Syncing profiles - refreshing data from database')

    const adminClient = createAdminClient()

    // Simply query all profiles to ensure they're loaded in the database
    const { data: profiles, error: queryError } = await adminClient
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (queryError) {
      console.error('[v0] Error querying profiles:', queryError)
      return NextResponse.json({ error: 'Failed to query profiles' }, { status: 500 })
    }

    console.log('[v0] Profiles synced successfully:', profiles?.length || 0)

    return NextResponse.json({
      success: true,
      profiles: profiles || [],
      count: profiles?.length || 0
    })
  } catch (error) {
    console.error('[v0] Error in sync-profiles:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sync error' },
      { status: 500 }
    )
  }
}
