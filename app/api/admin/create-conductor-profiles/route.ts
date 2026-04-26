import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// These RUTs need auth users first
const conductoresRuts = [
  '10574005-0',
  '15464094-0',
  '17768246-2',
  '9888992-2',
  '20114106-0',
  '18717311-6',
]

export async function POST(request: Request) {
  try {
    const supabase = createAdminClient()

    // Get organization ID for Transportes Labbe
    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('name', 'Transportes Labbe')
      .single()

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 400 })
    }

    // Get existing auth users
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()

    if (usersError) {
      console.error('[v0] Error listing users:', usersError)
      return NextResponse.json({ error: 'Failed to list auth users' }, { status: 500 })
    }

    const results = []
    let created = 0
    let failed = 0

    // Create profiles for RUTs that have auth users
    for (const rut of conductoresRuts) {
      // Find matching email for this RUT
      const matchingUser = users?.find(u => u.email?.includes(rut.split('-')[0]))

      if (!matchingUser) {
        console.log(`[v0] No auth user found for RUT ${rut}`)
        failed++
        results.push({ rut, status: 'FAILED', reason: 'No matching auth user' })
        continue
      }

      try {
        // Use upsert with email as conflict column to handle duplicates gracefully
        const { data, error } = await supabase
          .from('profiles')
          .upsert(
            {
              id: matchingUser.id,
              email: matchingUser.email,
              full_name: matchingUser.user_metadata?.full_name || 'Unknown',
              rut: rut,
              phone: matchingUser.user_metadata?.phone || null,
              role: 'admin',
              is_active: true,
              organization_id: org.id,
            },
            { onConflict: 'email' }
          )
          .select()
          .single()

        if (error) {
          console.error(`[v0] Error for ${rut} : ${error.message}`)
          failed++
          results.push({ rut, status: 'FAILED', reason: error.message })
        } else {
          console.log(`[v0] ✅ Profile created or updated for ${rut}`)
          created++
          results.push({ rut, status: 'SUCCESS', userId: matchingUser.id })
        }
      } catch (err) {
        console.error(`[v0] Exception for ${rut}:`, err)
        failed++
        results.push({ rut, status: 'FAILED', reason: String(err) })
      }
    }

    return NextResponse.json({
      created,
      failed,
      results,
    })
  } catch (err) {
    console.error('[v0] Error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    )
  }
}
