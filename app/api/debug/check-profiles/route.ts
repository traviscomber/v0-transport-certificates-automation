import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const adminClient = createAdminClient()

    // Get organization
    const { data: org } = await adminClient
      .from('organizations')
      .select('id, name')
      .eq('name', 'Transportes Labbe')
      .single()

    console.log('[v0] Organization:', org)

    // Get all profiles
    const { data: profiles } = await adminClient
      .from('profiles')
      .select('id, email, rut, organization_id, full_name')

    console.log('[v0] Total profiles:', profiles?.length)
    console.log('[v0] Profiles:', profiles)

    return NextResponse.json({
      organization: org,
      profiles: profiles,
      total: profiles?.length,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
