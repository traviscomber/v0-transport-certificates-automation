import { createAdminClient } from "@/lib/supabase/admin"
import { verifyAuth } from "@/lib/auth-middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

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

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await verifyAuth(request)
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createAdminClient()
    const url = new URL(request.url)
    const type = url.searchParams.get('type')
    const priority = url.searchParams.get('priority')
    const isRead = url.searchParams.get('is_read')
    const ejecutiva = url.searchParams.get('ejecutiva')
    const status = url.searchParams.get('status')
    const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '100', 10), 1), 500)
    const offset = Math.max(parseInt(url.searchParams.get('offset') || '0', 10), 0)

    let alertsLogQuery = supabase
      .from('alerts_log')
      .select('*', { count: 'exact' })

    if (ejecutiva) alertsLogQuery = alertsLogQuery.eq('ejecutiva_nombre', ejecutiva)
    if (type) alertsLogQuery = alertsLogQuery.eq('alert_type', type)
    if (priority) alertsLogQuery = alertsLogQuery.eq('priority', priority)
    if (status) alertsLogQuery = alertsLogQuery.eq('status', status)
    if (isRead !== null && isRead !== '') alertsLogQuery = alertsLogQuery.eq('is_read', isRead === 'true')

    const { data: logAlerts = [], error: logError } = await alertsLogQuery
      .order('created_at', { ascending: false })
      .limit(limit * 2)

    if (logError) {
      console.error('alerts_log query error:', logError)
    }

    // The legacy alerts table does not consistently contain ejecutiva_nombre in
    // production. Never add that column to its SQL filters; apply compatibility
    // filtering after normalization instead.
    let alertsQuery = supabase
      .from('alerts')
      .select('*', { count: 'exact' })

    if (type) alertsQuery = alertsQuery.eq('alert_type', type)
    if (priority) alertsQuery = alertsQuery.eq('priority', priority)
    if (status) alertsQuery = alertsQuery.eq('status', status)
    if (isRead !== null && isRead !== '') alertsQuery = alertsQuery.eq('is_read', isRead === 'true')

    const { data: rawAlerts = [], error: legacyError } = await alertsQuery
      .order('created_at', { ascending: false })
      .limit(limit * 2)

    if (legacyError) {
      console.warn('legacy alerts query skipped:', legacyError.message)
    }

    const alerts: NormalizedAlert[] = (logAlerts as AlertLog[]).map((alert) => ({
      id: `log_${alert.id}`,
      type: alert.alert_type || 'info',
      title: alert.title,
      message: alert.message || alert.description || '',
      description: alert.description || alert.message || '',
      priority: alert.priority || 'medium',
      category: alert.entity_type || 'general',
      is_read: alert.is_read ?? false,
      is_dismissed: alert.is_resolved ?? false,
      action_url: alert.action_url,
      ejecutiva_asignada: alert.ejecutiva_nombre,
      status: alert.status || 'pendiente',
      transportista_id: alert.transportista_id,
      driver_id: alert.driver_id,
      document_id: alert.document_id,
      document_type: alert.document_type,
      entity_name: alert.entity_name,
      metadata: alert.metadata || {},
      created_at: alert.created_at,
      source: 'alerts_log',
    }))

    const legacyAlerts: NormalizedAlert[] = legacyError
      ? []
      : (rawAlerts as AlertLog[]).map((alert) => ({
          id: alert.id,
          type: alert.alert_type || 'info',
          title: alert.title,
          message: alert.message || alert.description || '',
          description: alert.description || alert.message || '',
          priority: alert.priority || 'medium',
          category: alert.entity_type || 'general',
          is_read: alert.is_read ?? false,
          is_dismissed: alert.is_resolved ?? false,
          action_url: alert.action_url,
          ejecutiva_asignada: alert.ejecutiva_nombre,
          status: alert.status || 'pendiente',
          metadata: alert.metadata || {},
          created_at: alert.created_at,
          source: 'alerts_legacy',
        }))

    const allAlerts = [...alerts, ...legacyAlerts]
      .filter((alert) => !ejecutiva || alert.ejecutiva_asignada === ejecutiva)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(offset, offset + limit)

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

export async function PATCH(request: NextRequest) {
  try {
    const { user, error: authError } = await verifyAuth(request)
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createAdminClient()
    const body = await request.json()
    const { ids, is_read, is_dismissed } = body as { ids: string[], is_read?: boolean, is_dismissed?: boolean }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "ids es requerido" }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (is_read !== undefined) updateData.is_read = is_read
    if (is_dismissed !== undefined) updateData.is_resolved = is_dismissed

    const logIds = ids.filter((id) => id.startsWith('log_')).map((id) => id.slice(4))
    const legacyIds = ids.filter((id) => !id.startsWith('log_'))
    let updatedCount = 0

    if (logIds.length > 0) {
      const { data, error } = await supabase
        .from('alerts_log')
        .update(updateData)
        .in('id', logIds)
        .select('id')
      if (error) throw error
      updatedCount += data?.length || 0
    }

    if (legacyIds.length > 0) {
      const { data, error } = await supabase
        .from('alerts')
        .update(updateData)
        .in('id', legacyIds)
        .select('id')
      if (error) throw error
      updatedCount += data?.length || 0
    }

    return NextResponse.json({
      updated: updatedCount,
      message: `${updatedCount} alertas actualizadas`,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('alerts API PATCH error:', errorMessage)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
