import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'
export const revalidate = 30

interface AlertLog {
  id: string
  alert_type: string
  title: string
  message?: string
  description?: string
  priority: string
  entity_type?: string
  is_read?: boolean
  is_resolved?: boolean
  action_url?: string
  ejecutiva_nombre?: string
  status?: string
  transportista_id?: string
  driver_id?: string
  document_id?: string
  document_type?: string
  entity_name?: string
  metadata?: Record<string, unknown>
  created_at: string
}

interface NormalizedAlert {
  id: string
  type: string
  title: string
  message: string
  description: string
  priority: string
  category: string
  is_read: boolean
  is_dismissed: boolean
  action_url?: string
  ejecutiva_asignada?: string
  status: string
  metadata: Record<string, unknown>
  created_at: string
  source: string
  [key: string]: unknown
}

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

    // Get alerts from alerts_log table (AI-generated alerts)
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
      .limit(limit * 2)

    if (logError) {
      console.error('alerts_log query error:', logError)
    }

    // Get alerts from alerts table (legacy)
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
      console.error('alerts API GET error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Normalize alerts from alerts_log
    const alerts: NormalizedAlert[] = (logAlerts as AlertLog[]).map((a) => ({
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
    const legacyAlerts: NormalizedAlert[] = (rawAlerts as AlertLog[]).map((a) => ({
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
      metadata: a.metadata || {},
      created_at: a.created_at,
      source: 'alerts_table'
    }))

    // Combine and sort by date
    const allAlerts = [...alerts, ...legacyAlerts]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit)

    const response = NextResponse.json({
      alerts: allAlerts,
      total: allAlerts.length,
      limit,
      offset,
      ejecutiva: ejecutiva || null,
    })

    response.headers.set('Cache-Control', 'private, max-age=10, stale-while-revalidate=30')
    response.headers.set('Content-Type', 'application/json')

    return response
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('alerts API GET unexpected error:', errorMessage)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()
    const { ids, is_read, is_dismissed } = body as { ids: string[], is_read?: boolean, is_dismissed?: boolean }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "ids es requerido" }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (is_read !== undefined) updateData.is_read = is_read
    if (is_dismissed !== undefined) updateData.is_resolved = is_dismissed

    const { data: updated, error } = await supabase
      .from('alerts')
      .update(updateData)
      .in('id', ids)
      .select()

    if (error) throw error

    return NextResponse.json({ 
      data: updated, 
      message: `${updated?.length || 0} alertas actualizadas` 
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('alerts API PATCH error:', errorMessage)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
