import { createClient } from '@/lib/supabase/server'
import { assignRoleToUser, getUserRoles } from '@/lib/supabase/user-roles-service'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const userRoles = await getUserRoles(user.id)
    const isAdmin = userRoles.some(r => r.role === 'administrador')
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Only admins can assign roles' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { userId, role, entityId, entityType } = body

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, role' },
        { status: 400 }
      )
    }

    // Assign role
    const result = await assignRoleToUser(userId, role, entityId, entityType)
    
    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('[v0] Error assigning role:', error)
    return NextResponse.json(
      { error: 'Failed to assign role' },
      { status: 500 }
    )
  }
}
