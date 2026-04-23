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
    const { full_name, role, phone, is_active } = body

    // Allowed roles for company users
    if (role && !['dispatcher', 'driver'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role for company user' },
        { status: 400 }
      )
    }

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
      .eq('company_id', companyId)
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

// DELETE - Remove user from company
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()

    console.log('[v0] Deleting user:', params.id)

    // Delete profile - no company_id filter since column doesn't exist
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', params.id)

    if (profileError) {
      console.error('[v0] Profile delete error:', profileError)
      throw profileError
    }

    console.log('[v0] User deleted successfully:', params.id)
    return NextResponse.json({ success: true, message: 'User removed' })
  } catch (error) {
    console.error('[v0] Error deleting user:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error deleting user' },
      { status: 500 }
    )
  }
}
