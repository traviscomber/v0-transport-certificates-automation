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

    // Verify admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get all users
    const { data: users, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name', { ascending: true })

    if (error) throw error

    return NextResponse.json({ success: true, users })
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

    // Verify admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

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
    
    // Create auth user
    const { data: authUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password: Math.random().toString(36).slice(-12), // Temporary password
      email_confirm: true,
    })

    if (createError || !authUser.user) {
      throw new Error(createError?.message || 'Failed to create auth user')
    }

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
      // Clean up auth user if profile creation fails
      await adminClient.auth.admin.deleteUser(authUser.user.id)
      throw profileError
    }

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
