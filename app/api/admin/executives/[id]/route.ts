import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!url || !key) {
    throw new Error('Missing Supabase credentials')
  }
  
  return createClient(url, key)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseClient()
    const body = await request.json()
    const { id } = params

    // Update profile
    const { error } = await supabase
      .from('profiles')
      .update({
        is_active: body.is_active,
        full_name: body.full_name,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating executive:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseClient()
    const { id } = params

    // Soft delete - mark as inactive instead of hard delete
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 400 }
      )
    }

    // Optionally disable auth user
    try {
      await supabase.auth.admin.updateUserById(id, {
        user_metadata: { deleted_at: new Date().toISOString() }
      })
    } catch (err) {
      console.error('Error disabling auth user:', err)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting executive:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
