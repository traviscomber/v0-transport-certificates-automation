export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - List all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[v0] Admin users GET - Current user:', user.id)

    // Get all users - use admin client to bypass RLS
    const adminClient = createAdminClient()
    const { data: users, error } = await adminClient
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[v0] Error fetching users:', error)
      throw error
    }

    console.log('[v0] Retrieved users count:', users?.length)

    return NextResponse.json({ success: true, users: users || [] })
  } catch (error) {
    console.error('[v0] Error fetching users:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error fetching users' },
      { status: 500 }
    )
  }
}

// POST - Create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[v0] Admin users POST - Creating user, initiated by:', user.id)

    const body = await request.json()
    const { email, full_name, role, phone, is_active = true } = body

    if (!email || !full_name || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: email, full_name, role' },
        { status: 400 }
      )
    }

    // Use admin client to create user
    const adminClient = createAdminClient()
    
    // Create auth user with temporary password
    const tempPassword = Math.random().toString(36).slice(-12)
    console.log('[v0] Creating auth user with email:', email)
    
    const { data: authUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
    })

    if (createError || !authUser.user) {
      console.error('[v0] Auth user creation error:', createError)
      throw new Error(createError?.message || 'Failed to create auth user')
    }

    console.log('[v0] Auth user created:', authUser.user.id)

    // Create profile
    const { data: newProfile, error: profileError } = await adminClient
      .from('profiles')
      .insert({
        id: authUser.user.id,
        email,
        full_name,
        role,
        phone,
        is_active,
      })
      .select()
      .single()

    if (profileError) {
      console.error('[v0] Profile creation error:', profileError)
      // Clean up auth user if profile creation fails
      await adminClient.auth.admin.deleteUser(authUser.user.id)
      throw profileError
    }

    console.log('[v0] User created successfully:', authUser.user.id)

    return NextResponse.json({
      success: true,
      user: newProfile,
      message: 'User created successfully. A confirmation email will be sent.',
    })
  } catch (error) {
    console.error('[v0] Error creating user:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error creating user' },
      { status: 500 }
    )
  }
}
