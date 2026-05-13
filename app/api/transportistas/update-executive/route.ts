import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function PUT(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Missing Supabase credentials' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { transportista_id, executive_id } = await request.json()

    if (!transportista_id || !executive_id) {
      return NextResponse.json(
        { error: 'Missing required fields: transportista_id, executive_id' },
        { status: 400 }
      )
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if current user is an executive or superadmin
    const { data: currentUser } = await supabase
      .from('executive_staff')
      .select('id, cargo, transportista_id')
      .eq('email', user.email)
      .single()

    const isAdmin = currentUser?.cargo === 'SUPERADMIN'
    const isExecutive = currentUser?.cargo === 'EJECUTIVA' || currentUser?.cargo === 'EJECUTIVO'

    if (!isAdmin && !isExecutive) {
      return NextResponse.json(
        { error: 'Only executives or superadmin can modify assignments' },
        { status: 403 }
      )
    }

    // First, delete any existing assignment for this transportista
    await supabase
      .from('executive_staff')
      .delete()
      .eq('transportista_id', transportista_id)

    // Then insert the new assignment
    const { data, error } = await supabase
      .from('executive_staff')
      .insert({
        transportista_id,
        id: executive_id
      })
      .select()
      .single()

    if (error) {
      console.error('[v0] Error updating executive assignment:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Executive assignment updated',
      data 
    })
  } catch (error) {
    console.error('[v0] Error in update-executive:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
