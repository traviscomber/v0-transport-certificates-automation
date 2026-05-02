import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

// Real schema: alerts(id, user_id, organization_id, title, message, type, priority, category, is_read, is_dismissed, action_url, metadata, created_at)

export async function GET(request: Request) {
  try {
    const supabase = createAdminClient()

    const url = new URL(request.url)
    const type = url.searchParams.get('type')
    const priority = url.searchParams.get('priority')
    const is_read = url.searchParams.get('is_read')
    const limit = parseInt(url.searchParams.get('limit') || '100')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    let query = supabase
      .from('alerts')
      .select('*', { count: 'exact' })

    if (type) query = query.eq('type', type)
    if (priority) query = query.eq('priority', priority)
    if (is_read !== null && is_read !== '') query = query.eq('is_read', is_read === 'true')

    const { data: alerts, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('[ALERTS API] GET error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      alerts: alerts || [],
      total: count || 0,
      limit,
      offset,
    })
  } catch (error: any) {
    console.error('[ALERTS API] GET unexpected error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()
    const { ids, is_read, is_dismissed } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "ids es requerido" }, { status: 400 })
    }

    const updateData: any = {}
    if (is_read !== undefined) updateData.is_read = is_read
    if (is_dismissed !== undefined) updateData.is_dismissed = is_dismissed

    const { data: updated, error } = await supabase
      .from('alerts')
      .update(updateData)
      .in('id', ids)
      .select()

    if (error) throw error

    return NextResponse.json({ data: updated, message: `${updated.length} alertas actualizadas` })
  } catch (error: any) {
    console.error('[ALERTS API] PATCH error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
