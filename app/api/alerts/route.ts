import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'
export const revalidate = 30 // ISR: revalidate every 30 seconds

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

    // FIRST: Get alerts from alerts_log table (new automated alerts from AI analysis)
    console.log('[v0] Fetching alerts from alerts_log (AI-generated alerts)')
    let alertsLogQuery = supabase
      .from('alerts_log')
      .select('*', { count: 'exact' })

    if (ejecutiva) alertsLogQuery = alertsLogQuery.eq('ejecutiva_nombre', ejecutiva)
    if (type) alertsLogQuery = alertsLogQuery.eq('alert_type', type)
    if (priority) alertsLogQuery = alertsLogQuery.eq('priority', priority)
    if (status) alertsLogQuery = alertsLogQuery.eq('status', status)
    if (is_read !== null && is_read !== '') alertsLogQuery = alertsLogQuery.eq('is_read', is_read === 'true')

    const { data: logAlerts = [], error: logError } = await alertsLogQuery
      .order('created_at', { ascending: false })
      .limit(limit * 2) // Fetch more to account for duplicates

    console.log('[v0] alerts_log result:', { count: logAlerts?.length || 0, error: logError?.message || null })
    if (logError) console.error('[v0] alerts_log query error:', logError)

    // SECOND: Get alerts from alerts table (legacy alerts)
    let alertsQuery = supabase
      .from('alerts')
      .select('*', { count: 'exact' })

    if (ejecutiva) alertsQuery = alertsQuery.eq('ejecutiva_nombre', ejecutiva)
    if (type) alertsQuery = alertsQuery.eq('alert_type', type)
    if (priority) alertsQuery = alertsQuery.eq('priority', priority)
    if (status) alertsQuery = alertsQuery.eq('status', status)
    if (is_read !== null && is_read !== '') alertsQuery = alertsQuery.eq('is_read', is_read === 'true')

    const { data: rawAlerts = [], error } = await alertsQuery
      .order('created_at', { ascending: false })
      .limit(limit * 2)

    if (error) {
      console.error('[ALERTS API] GET error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Normalize alerts from alerts_log table
    const alerts: any[] = (logAlerts || []).map((a: any) => ({
      id: `log_${a.id}`,
      type: a.alert_type || 'info',
      title: a.title,
      message: a.message || a.description || '',
      description: a.description || a.message || '',
      priority: a.priority || 'medium',
      category: a.entity_type || 'general',
      is_read: a.is_read ?? false,
      is_dismissed: a.is_resolved ?? false,
      action_url: a.action_url,
      ejecutiva_asignada: a.ejecutiva_nombre,
      status: a.status || 'pendiente',
      transportista_id: a.transportista_id,
      driver_id: a.driver_id,
      document_id: a.document_id,
      document_type: a.document_type,
      entity_name: a.entity_name,
      metadata: a.metadata || {},
      created_at: a.created_at,
      source: 'alerts_log (AI)'
    }))

    // Add normalized alerts from alerts table
    const legacyAlerts = (rawAlerts || []).map((a: any) => ({
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
      ejecutiva_asignada: a.ejecutiva_nombre,
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
      source: 'alerts_table'
    }))

    // Combine and sort all alerts by created_at (newest first)
    const allAlerts = [...alerts, ...legacyAlerts].sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }).slice(0, limit)

    console.log(`[v0] Fetched ${alerts.length} alerts from alerts_log and ${legacyAlerts.length} from alerts table`)

    const response = NextResponse.json({
      alerts: allAlerts,
      total: allAlerts.length,
      limit,
      offset,
      ejecutiva: ejecutiva || null,
    })

    // Set cache headers for optimal performance
    response.headers.set('Cache-Control', 'private, max-age=10, stale-while-revalidate=30')
    response.headers.set('Content-Type', 'application/json')

    return response
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
