export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface RouteParams {
  params: {
    id: string
  }
}

// GET - Get single user
export async function GET(request: NextRequest, { params }: RouteParams) {
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

    const { data: userData, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, user: userData })
  } catch (error) {
    console.error('[v0] Error fetching user:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error fetching user' },
      { status: 500 }
    )
  }
}

// PUT - Update user
export async function PUT(request: NextRequest, { params }: RouteParams) {
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
    const { full_name, role, phone, is_active } = body

    const { data: updatedUser, error } = await supabase
      .from('profiles')
      .update({
        full_name,
        role,
        phone,
        is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error) {
    console.error('[v0] Error updating user:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error updating user' },
      { status: 500 }
    )
  }
}

// DELETE - Delete user
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    const adminClient = createAdminClient()

    // Delete profile (auth user will be deleted via cascade)
    const { error: profileError } = await adminClient
      .from('profiles')
      .delete()
      .eq('id', params.id)

    if (profileError) throw profileError

    // Delete auth user
    await adminClient.auth.admin.deleteUser(params.id)

    return NextResponse.json({ success: true, message: 'User deleted successfully' })
  } catch (error) {
    console.error('[v0] Error deleting user:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error deleting user' },
      { status: 500 }
    )
  }
}
