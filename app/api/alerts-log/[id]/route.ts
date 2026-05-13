import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * DELETE /api/alerts-log/[id]
 * Delete alert from alerts_log table (AI-generated alerts)
 * Only superadmin can delete
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createAdminClient()
    const { id } = await params

    // Get user from header to verify superadmin status
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized - missing auth header' },
        { status: 401 }
      )
    }

    // Extract token and verify user
    const token = authHeader.replace('Bearer ', '')
    
    // Verify token and get user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (!user || userError) {
      return NextResponse.json(
        { error: 'Unauthorized - invalid token' },
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
      console.log('[v0] DELETE alerts_log denied - user not superadmin:', user.email)
      return NextResponse.json(
        { error: 'Forbidden - only superadmin can delete alerts' },
        { status: 403 }
      )
    }

    console.log('[v0] Superadmin deleting alert from alerts_log:', { alertId: id, user: user.email })

    // Delete from alerts_log table
    const { error } = await supabase
      .from('alerts_log')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[v0] Error deleting from alerts_log:', error)
      throw error
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Alert deleted from alerts_log by superadmin' 
    })
  } catch (error) {
    console.error('Error deleting alert from alerts_log:', error)
    return NextResponse.json({ error: 'Failed to delete alert' }, { status: 500 })
  }
}
