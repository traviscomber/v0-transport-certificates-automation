import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

// GET single alert
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ data, success: true })
  } catch (error) {
    console.error('Error fetching alert:', error)
    return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
  }
}

// PUT update alert (mark as read/dismissed)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    const body = await request.json()
    
    const updateData: Record<string, unknown> = {}
    
    if (body.is_read !== undefined) {
      updateData.is_read = body.is_read
      if (body.is_read) updateData.read_at = new Date().toISOString()
    }
    
    if (body.is_dismissed !== undefined) {
      updateData.is_dismissed = body.is_dismissed
      if (body.is_dismissed) updateData.dismissed_at = new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from('alerts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ data, success: true })
  } catch (error) {
    console.error('Error updating alert:', error)
    return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 })
  }
}

// DELETE alert (only superadmin can delete)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    
    // Get current user info
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - must be logged in' },
        { status: 401 }
      )
    }

    // Check if user is superadmin
    const { data: superadminUser, error: superadminError } = await supabase
      .from('executive_staff')
      .select('id, cargo, email')
      .eq('email', user.email)
      .eq('cargo', 'SUPERADMIN')
      .single()

    if (superadminError || !superadminUser) {
      console.log('[v0] DELETE alert denied - user not superadmin:', user.email)
      return NextResponse.json(
        { error: 'Forbidden - only superadmin can delete alerts' },
        { status: 403 }
      )
    }

    console.log('[v0] Superadmin deleting alert:', { alertId: id, user: user.email })
    
    // Delete from alerts table
    const { error: alertError } = await supabase
      .from('alerts')
      .delete()
      .eq('id', id)
    
    if (alertError) throw alertError

    // Also try to delete from alerts_log if the id format suggests it came from there
    if (id.startsWith('log_')) {
      const logId = id.replace('log_', '')
      await supabase
        .from('alerts_log')
        .delete()
        .eq('id', logId)
    }
    
    return NextResponse.json({ success: true, message: 'Alert deleted by superadmin' })
  } catch (error) {
    console.error('Error deleting alert:', error)
    return NextResponse.json({ error: 'Failed to delete alert' }, { status: 500 })
  }
}
