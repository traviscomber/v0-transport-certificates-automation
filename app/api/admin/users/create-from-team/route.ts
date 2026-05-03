import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Creating users from team data')

    const body = await request.json()
    const { users } = body

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: 'Invalid users array' }, { status: 400 })
    }

    const adminClient = createAdminClient()
    const created = []
    const errors = []

    // Get Transportes Labbe organization ID
    console.log('[v0] Fetching Transportes Labbe organization')
    const { data: org, error: orgError } = await adminClient
      .from('organizations')
      .select('id')
      .eq('name', 'Transportes Labbe')
      .single()

    if (orgError || !org) {
      console.error('[v0] Could not find Transportes Labbe organization')
      return NextResponse.json(
        { error: 'Transportes Labbe organization not found' },
        { status: 400 }
      )
    }

    const organizationId = org.id
    console.log('[v0] Using organization_id:', organizationId)

    // Step 1: Create auth users first, then profiles
    for (const userData of users) {
      try {
        if (!userData.full_name || !userData.rut) {
          throw new Error('Missing full_name or rut')
        }

        const email = userData.email || `${userData.rut.replace(/[^0-9]/g, '')}@labbe.local`
        const rut = userData.rut.trim()
        const password = rut // Password is the RUT itself

        console.log('[v0] Creating auth user for:', email, 'RUT:', rut)

        // Step 1a: Create auth user
        const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
          email: email,
          password: password,
          user_metadata: {
            rut: rut,
            full_name: userData.full_name,
          },
          email_confirm: true,
        })

        let userId: string = randomUUID() as string
        if (authUser?.user?.id) {
          userId = authUser.user.id as string
          console.log('[v0] Auth user created with ID:', userId)
        } else if (authError) {
          console.warn('[v0] Auth user creation issue:', authError.message)
          // Continue - we'll use the generated UUID
        }

        // Step 1b: Create profile with the same ID as auth user
        console.log('[v0] Creating profile with ID:', userId)

        const { data, error } = await adminClient
          .from('profiles')
          .insert({
            id: userId,
            email: email,
            full_name: userData.full_name,
            role: 'admin',
            rut: rut,
            phone: userData.phone || '',
            is_active: true,
            organization_id: organizationId,
          })
          .select()
          .single()

        if (error) {
          console.error('[v0] Error for', rut, ':', error.message)
          errors.push({ rut, error: error.message })
        } else {
          console.log('[v0] User created:', rut)
          created.push(rut)
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        console.error('[v0] Error:', msg)
        errors.push({ rut: userData.rut, error: msg })
      }
    }

    console.log('[v0] Done. Created:', created.length, 'Errors:', errors.length)

    return NextResponse.json({
      success: errors.length === 0,
      created: created.length,
      errors: errors,
      message: `Created ${created.length} users${errors.length > 0 ? `, ${errors.length} errors` : ''}`
    })
  } catch (err) {
    console.error('[v0] Error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: 'POST users array to create profiles' })
}
