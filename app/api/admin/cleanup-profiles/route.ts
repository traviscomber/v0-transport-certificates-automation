import { createAdminClient } from '@/lib/supabase/admin'
import { requireServerActor } from '@/lib/auth/server-actor'
import { NextResponse } from 'next/server'

async function requireAdminResponse() {
  const auth = await requireServerActor(['admin'])
  if (!auth.actor) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  return null
}

export async function GET() {
  const denied = await requireAdminResponse()
  if (denied) return denied

  try {
    const adminClient = createAdminClient()
    const { data: nonLabbeProfiles } = await adminClient
      .from('profiles')
      .select('id, email, full_name, rut')
      .not('email', 'ilike', '%@labbe.cl%')

    return NextResponse.json({
      message: 'Profiles to delete',
      count: nonLabbeProfiles?.length || 0,
      profiles: nonLabbeProfiles || [],
    })
  } catch (err) {
    console.error('[admin] Error:', err)
    return NextResponse.json({ error: 'Error fetching profiles' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const denied = await requireAdminResponse()
  if (denied) return denied

  try {
    const { action } = await request.json()
    const adminClient = createAdminClient()

    if (action !== 'delete_non_labbe') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const { data: toDelete, error: fetchError } = await adminClient
      .from('profiles')
      .select('id')
      .not('email', 'ilike', '%@labbe.cl%')

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 400 })
    }

    if (!toDelete?.length) {
      return NextResponse.json({ success: true, message: 'No non-labbe profiles found', deleted: 0 })
    }

    let deletedCount = 0
    for (const profile of toDelete) {
      const { error: deleteError } = await adminClient.from('profiles').delete().eq('id', profile.id)
      if (!deleteError) deletedCount++
    }

    const { data: remaining } = await adminClient
      .from('profiles')
      .select('id, email, full_name')
      .order('full_name')

    return NextResponse.json({
      success: true,
      message: `Deleted ${deletedCount} non-labbe profiles`,
      deleted: deletedCount,
      remaining: remaining || [],
    })
  } catch (err) {
    console.error('[admin] Error:', err)
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
