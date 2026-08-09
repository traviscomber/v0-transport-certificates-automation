export const dynamic = 'force-dynamic'

import { randomBytes } from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireServerActor } from '@/lib/auth/server-actor'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const auth = await requireServerActor(['admin'])
    if (!auth.actor) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const adminClient = createAdminClient()
    const { data: users, error } = await adminClient
      .from('profiles')
      .select('id, email, full_name, role, phone, is_active, organization_id, created_at, updated_at')
      .order('created_at', { ascending: false })

    if (error) throw error

    console.log('[v0] Verified admin listed users:', auth.actor.id, users?.length || 0)
    return NextResponse.json({ success: true, users: users || [] })
  } catch (error) {
    console.error('[v0] Error fetching users:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error fetching users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireServerActor(['admin'])
    if (!auth.actor) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const { email, full_name, role, phone, is_active = true, organization_id = null } = body

    if (!email || !full_name || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: email, full_name, role' },
        { status: 400 }
      )
    }

    const allowedRoles = new Set(['admin', 'ejecutiva', 'prevencionista', 'transportista', 'driver', 'conductor'])
    if (!allowedRoles.has(String(role))) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const adminClient = createAdminClient()
    const tempPassword = `${randomBytes(18).toString('base64url')}Aa1!`

    const { data: authUser, error: createError } = await adminClient.auth.admin.createUser({
      email: String(email).trim().toLowerCase(),
      password: tempPassword,
      email_confirm: true,
    })

    if (createError || !authUser.user) {
      throw new Error(createError?.message || 'Failed to create auth user')
    }

    const { data: newProfile, error: profileError } = await adminClient
      .from('profiles')
      .insert({
        id: authUser.user.id,
        email: String(email).trim().toLowerCase(),
        full_name,
        role,
        phone,
        is_active,
        organization_id,
      })
      .select('id, email, full_name, role, phone, is_active, organization_id, created_at, updated_at')
      .single()

    if (profileError) {
      await adminClient.auth.admin.deleteUser(authUser.user.id)
      throw profileError
    }

    console.log('[v0] Verified admin created user:', auth.actor.id, authUser.user.id)

    return NextResponse.json({
      success: true,
      user: newProfile,
      message: 'User created successfully.',
    }, { status: 201 })
  } catch (error) {
    console.error('[v0] Error creating user:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error creating user' },
      { status: 500 }
    )
  }
}
