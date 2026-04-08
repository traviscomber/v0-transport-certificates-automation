import { createClient } from '@/lib/supabase/server'
import { getUserRoles, getUserPrimaryRole } from '@/lib/supabase/user-roles-service'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's roles
    const roles = await getUserRoles(user.id)
    const primaryRole = await getUserPrimaryRole(user.id)

    return NextResponse.json({
      success: true,
      data: {
        userId: user.id,
        roles,
        primaryRole,
      },
    })
  } catch (error) {
    console.error('[v0] Error fetching user roles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 }
    )
  }
}
