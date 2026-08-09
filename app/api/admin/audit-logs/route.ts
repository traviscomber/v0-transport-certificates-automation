import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireServerActor } from '@/lib/auth/server-actor'

export async function GET(request: NextRequest) {
  const auth = await requireServerActor(['admin'])
  if (!auth.actor) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const userId = request.nextUrl.searchParams.get('userId')
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data: logs, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(100)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(logs || [])
  } catch (error) {
    console.error('[audit] Error fetching audit logs:', error)
    return NextResponse.json({ error: 'Unable to fetch audit logs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireServerActor()
  if (!auth.actor) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await request.json()
    const { action, resource_type, resource_id } = body

    if (!action || !resource_type) {
      return NextResponse.json({ error: 'action and resource_type are required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ipAddress = forwardedFor?.split(',')[0]?.trim() || null
    const userAgent = request.headers.get('user-agent')

    const { error } = await supabase.from('audit_logs').insert({
      user_id: auth.actor.id,
      action,
      resource_type,
      resource_id: resource_id || null,
      ip_address: ipAddress,
      user_agent: userAgent,
      timestamp: new Date().toISOString(),
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[audit] Error creating audit log:', error)
    return NextResponse.json({ error: 'Unable to create audit log' }, { status: 500 })
  }
}
