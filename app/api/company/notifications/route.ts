import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Read from both alerts and alerts_log tables
export async function GET(request: NextRequest) {
  try {
    const adminClient = createAdminClient()

    // Fetch from alerts table (old alerts)
    const { data: alerts, error: alertsError } = await adminClient
      .from('alerts')
      .select('id, type, title, message, is_read, is_dismissed, action_url, metadata, created_at, priority, category')
      .eq('is_dismissed', false)
      .order('created_at', { ascending: false })
      .limit(50)

    // Fetch from alerts_log table (new alerts from triggers)
    const { data: alertsLog, error: logError } = await adminClient
      .from('alerts_log')
      .select('id, alert_type, title, description, message, is_read, is_resolved, action_url, metadata, created_at, priority, ejecutiva_nombre, document_type, entity_name')
      .eq('is_resolved', false)
      .order('created_at', { ascending: false })
      .limit(50)

    if (alertsError) {
      console.error('[v0] Error fetching alerts:', alertsError)
    }
    if (logError) {
      console.error('[v0] Error fetching alerts_log:', logError)
    }

    // Map alerts table entries
    const notificationsFromAlerts = (alerts || []).map((a: any) => ({
      id: a.id,
      type: a.type || 'status_change',
      title: a.title,
      message: a.message,
      read: a.is_read,
      is_read: a.is_read,
      created_at: a.created_at,
      related_document_id: a.metadata?.document_id || null,
      priority: a.priority,
      category: a.category,
      action_url: a.action_url,
      source: 'alerts',
    }))

    // Map alerts_log table entries
    const notificationsFromLog = (alertsLog || []).map((a: any) => ({
      id: a.id,
      type: a.alert_type || 'info',
      title: a.title,
      message: a.message || a.description,
      read: a.is_read,
      is_read: a.is_read,
      created_at: a.created_at,
      related_document_id: a.metadata?.document_id || null,
      priority: a.priority,
      category: a.document_type,
      action_url: a.action_url,
      ejecutiva: a.ejecutiva_nombre,
      entity_name: a.entity_name,
      source: 'alerts_log',
    }))

    // Combine and sort by date
    const allNotifications = [...notificationsFromAlerts, ...notificationsFromLog]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 50)

    return NextResponse.json({ notifications: allNotifications }, {
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
    })
  } catch (error) {
    console.error('[v0] Error in notifications GET:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
