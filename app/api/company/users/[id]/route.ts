export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

interface RouteParams {
  params: {
    id: string
  }
}

// GET - Get single company user
export async function GET(request: NextRequest, { params }: RouteParams) {
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

    const { data: userData, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', params.id)
      .eq('company_id', companyId)
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

// PUT - Update company user
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    console.log('[v0] PUT request for user:', params.id)

    const body = await request.json()
    const { full_name, role, phone, is_active } = body

    console.log('[v0] Update data:', { full_name, role, phone, is_active })

    // Allowed roles for company users
    if (role && !['admin', 'dispatcher', 'driver'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role for company user' },
        { status: 400 }
      )
    }

    // Use admin client to bypass RLS
    const adminClient = createAdminClient()

    const { data: updatedUser, error } = await adminClient
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

    if (error) {
      console.error('[v0] Update error:', error)
      throw error
    }

    console.log('[v0] User updated successfully')
    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error) {
    console.error('[v0] Error updating user:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error updating user' },
      { status: 500 }
    )
  }
}

// DELETE - Remove user from company
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    console.log('[v0] DELETE request for user:', params.id)

    // Use admin client to bypass RLS
    const adminClient = createAdminClient()

    // Verify user exists
    const { data: profile, error: fetchError } = await adminClient
      .from('profiles')
      .select('id, email, full_name')
      .eq('id', params.id)
      .single()

    if (fetchError || !profile) {
      console.warn('[v0] User not found:', params.id)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('[v0] Found user to delete:', profile.email)

    // Delete profile - using admin client to bypass RLS
    const { error: profileError } = await adminClient
      .from('profiles')
      .delete()
      .eq('id', params.id)

    if (profileError) {
      console.error('[v0] Profile delete error:', profileError)
      return NextResponse.json(
        { error: 'Failed to delete profile: ' + profileError.message },
        { status: 400 }
      )
    }

    console.log('[v0] User deleted successfully:', params.id)
    
    // Verify deletion
    const { data: verifyDelete } = await adminClient
      .from('profiles')
      .select('id')
      .eq('id', params.id)

    if (verifyDelete && verifyDelete.length > 0) {
      console.error('[v0] WARNING: User still exists after delete attempt')
      return NextResponse.json(
        { error: 'User still exists after deletion - possible constraint issue' },
        { status: 400 }
      )
    }

    console.log('[v0] Deletion verified - user no longer exists')
    return NextResponse.json({ success: true, message: 'User removed successfully' })
  } catch (error) {
    console.error('[v0] Error deleting user:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error deleting user' },
      { status: 500 }
    )
  }
}
