import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const adminClient = createAdminClient()

    // Get organization
    const { data: org, error: orgError } = await adminClient
      .from('organizations')
      .select('id')
      .eq('name', 'Transportes Labbe')
      .single()

    if (orgError || !org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 400 })
    }

    console.log('[v0] Using organization:', org.id)

    // Update all profiles with null organization_id
    const { error: updateError } = await adminClient
      .from('profiles')
      .update({ organization_id: org.id })
      .is('organization_id', null)

    if (updateError) {
      console.error('[v0] Update error:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Profiles updated' })
  } catch (err) {
    console.error('[v0] Error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
