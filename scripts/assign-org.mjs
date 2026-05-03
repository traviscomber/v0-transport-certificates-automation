import { createAdminClient } from '../lib/supabase/admin.js'

async function assignOrganizationToProfiles() {
  try {
    const adminClient = createAdminClient()

    // Get Transportes Labbe organization
    const { data: org, error: orgError } = await adminClient
      .from('organizations')
      .select('id')
      .eq('name', 'Transportes Labbe')
      .single()

    if (orgError || !org) {
      console.error('[v0] Could not find organization:', orgError?.message)
      return
    }

    console.log('[v0] Found organization:', org.id)

    // Get all profiles without organization_id
    const { data: profiles, error: profilesError } = await adminClient
      .from('profiles')
      .select('id, email, rut')
      .is('organization_id', null)

    if (profilesError) {
      console.error('[v0] Error fetching profiles:', profilesError.message)
      return
    }

    console.log('[v0] Found', profiles?.length || 0, 'profiles without organization_id')

    if (!profiles || profiles.length === 0) {
      console.log('[v0] No profiles to update')
      return
    }

    // Update each profile
    for (const profile of profiles) {
      const { error: updateError } = await adminClient
        .from('profiles')
        .update({ organization_id: org.id })
        .eq('id', profile.id)

      if (updateError) {
        console.error('[v0] Error updating profile', profile.email, ':', updateError.message)
      } else {
        console.log('[v0] Updated profile:', profile.email)
      }
    }

    console.log('[v0] Done!')
  } catch (err) {
    console.error('[v0] Error:', err)
  }
}

assignOrganizationToProfiles()
