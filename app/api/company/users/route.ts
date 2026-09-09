export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

async function resolveInternalLabbeUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('supabase_token')?.value
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!token || !supabaseUrl || !supabaseAnonKey) return null

  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: supabaseAnonKey,
    },
  })

  if (!response.ok) return null

  const user = await response.json()
  const email = String(user?.email || '').trim().toLowerCase()
  if (!email.endsWith('@labbe.cl')) return null

  return { id: String(user.id), email }
}

// GET - Read-only internal Labbe directory.
export async function GET() {
  try {
    const actor = await resolveInternalLabbeUser()
    if (!actor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createAdminClient()
    const { data: users, error } = await adminClient
      .from('profiles')
      .select('id, email, full_name, role, phone, is_active, created_at')
      .eq('is_active', true)
      .ilike('email', '%@labbe.cl')
      .order('full_name', { ascending: true })

    if (error) {
      console.error('[company-users] Database error:', error)
      throw error
    }

    return new NextResponse(JSON.stringify(users || []), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    })
  } catch (error) {
    console.error('[company-users] Error fetching users:', error)
    return NextResponse.json(
      { error: 'Error fetching users' },
      { status: 500 }
    )
  }
}

// POST - Invite new user to company
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const companyId = cookieStore.get('company_id')?.value

    if (!companyId) {
      return NextResponse.json({ error: 'No company context' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is company admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, company_id')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin' || profile?.company_id !== companyId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { email, full_name, role, phone } = body

    if (!email || !full_name || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: email, full_name, role' },
        { status: 400 }
      )
    }

    // Allowed roles for company users (not admin level)
    const allowedRoles = ['dispatcher', 'driver']
    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role for company user' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    // Create auth user
    const { data: authUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password: Math.random().toString(36).slice(-12),
      email_confirm: true,
    })

    if (createError || !authUser.user) {
      throw new Error(createError?.message || 'Failed to create auth user')
    }

    // Create profile linked to company
    const { data: newProfile, error: profileError } = await adminClient
      .from('profiles')
      .insert({
        id: authUser.user.id,
        email,
        full_name,
        role,
        phone,
        company_id: companyId,
        is_active: true,
      })
      .select()
      .single()

    if (profileError) {
      await adminClient.auth.admin.deleteUser(authUser.user.id)
      throw profileError
    }

    return NextResponse.json({
      success: true,
      user: newProfile,
      message: 'User invited successfully',
    })
  } catch (error) {
    console.error('[v0] Error inviting user:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error inviting user' },
      { status: 500 }
    )
  }
}
