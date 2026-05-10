import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

// Production schema: alerts_log table with ejecutiva_nombre, status, action_type fields

export async function GET(request: Request) {
  try {
    const supabase = createAdminClient()

    const url = new URL(request.url)
    const type = url.searchParams.get('type')
    const priority = url.searchParams.get('priority')
    const is_read = url.searchParams.get('is_read')
    const ejecutiva = url.searchParams.get('ejecutiva')
    const status = url.searchParams.get('status')
    const limit = parseInt(url.searchParams.get('limit') || '100')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    let query = supabase
      .from('alerts')
      .select('*', { count: 'exact' })

    // Filter by ejecutiva - check both ejecutiva_asignada and status
    if (ejecutiva) query = query.eq('metadata', { ejecutiva_asignada: ejecutiva })
    
    if (type) query = query.eq('alert_type', type)
    if (priority) query = query.eq('priority', priority)
    if (status) query = query.eq('status', status)
    if (is_read !== null && is_read !== '') query = query.eq('is_read', is_read === 'true')

    const { data: rawAlerts, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('[ALERTS API] GET error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Normalize alerts: map alerts table fields to expected format
    const alerts = (rawAlerts || []).map((a: any) => ({
      id: a.id,
      type: a.alert_type || 'info',
      title: a.title,
      message: a.message || a.description || '',
      description: a.description || a.message || '',
      priority: a.priority || 'medium',
      category: a.entity_type || 'general',
      is_read: a.is_read ?? false,
      is_dismissed: a.is_resolved ?? false,
      action_url: a.action_url,
      ejecutiva_asignada: a.metadata?.ejecutiva_asignada,
      status: a.status || 'pendiente',
      action_type: a.action_type,
      action_notes: a.action_notes,
      actioned_by: a.actioned_by,
      actioned_at: a.actioned_at,
      transportista_id: a.transportista_id,
      subcontratista_id: a.subcontratista_id,
      driver_id: a.driver_id,
      document_id: a.document_id,
      document_type: a.document_type,
      entity_name: a.entity_name,
      metadata: a.metadata || {},
      created_at: a.created_at,
    }))

    return NextResponse.json({
      alerts,
      total: count || 0,
      limit,
      offset,
      ejecutiva: ejecutiva || null,
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
    if (is_dismissed !== undefined) updateData.is_resolved = is_dismissed

    const { data: updated, error } = await supabase
      .from('alerts')
      .update(updateData)
      .in('id', ids)
      .select()

    if (error) throw error

    return NextResponse.json({ data: updated, message: `${updated?.length || 0} alertas actualizadas` })
  } catch (error: any) {
    console.error('[ALERTS API] PATCH error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
