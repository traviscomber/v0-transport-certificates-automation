import { assignRoleToUser } from '@/lib/supabase/user-roles-service'
import { requireServerActor } from '@/lib/auth/server-actor'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const auth = await requireServerActor(['admin'])
    if (!auth.actor) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const { userId, role, entityId, entityType } = body

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, role' },
        { status: 400 }
      )
    }

    const result = await assignRoleToUser(userId, role, entityId, entityType)
    console.log('[v0] Verified admin assigned role:', auth.actor.id, userId, role)

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('[v0] Error assigning role:', error)
    return NextResponse.json({ error: 'Failed to assign role' }, { status: 500 })
  }
}
