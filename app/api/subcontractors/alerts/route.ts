import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/subcontractors/alerts
 * Fetch all document-related alerts for display in dashboard
 * Sources: alerts_log (AI/automated) and alerts (legacy)
 */
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient()

    // Get alerts from alerts_log (new automated alerts)
    const { data: logAlerts = [], error: logError } = await supabase
      .from('alerts_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (logError) {
      console.error('[v0] Error fetching alerts_log:', logError)
    }

    // Get alerts from legacy alerts table
    const { data: legacyAlerts = [], error: legacyError } = await supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (legacyError) {
      console.error('[v0] Error fetching legacy alerts:', legacyError)
    }

    // Map alert_type/priority to frontend expected types
    const mapAlertType = (alert: any): 'pending_review' | 'expiring_soon' | 'expired' | 'rejected' => {
      const type = alert.alert_type?.toLowerCase() || ''
      const priority = alert.priority?.toLowerCase() || ''
      
      if (type.includes('rejected') || type === 'error') return 'rejected'
      if (type.includes('expired') || priority === 'critical') return 'expired'
      if (type.includes('expiring') || priority === 'high' || priority === 'medium') return 'expiring_soon'
      return 'pending_review'
    }

    // Format alerts from alerts_log
    const formattedLogAlerts = (logAlerts || []).map((alert: any) => ({
      id: `log_${alert.id}`,
      subcontractor_id: alert.transportista_id || alert.driver_id || '',
      subcontractor_name: alert.entity_name || 'Sistema',
      document_type: alert.document_type || alert.title || 'Documento',
      alert_type: mapAlertType(alert),
      message: alert.message || alert.description || '',
      expires_at: null,
      is_read: alert.is_read || false,
      created_at: alert.created_at
    }))

    // Format alerts from legacy table
    const formattedLegacyAlerts = (legacyAlerts || []).map((alert: any) => ({
      id: alert.id,
      subcontractor_id: alert.transportista_id || alert.subcontratista_id || alert.driver_id || '',
      subcontractor_name: alert.entity_name || alert.ejecutiva_nombre || 'Sistema',
      document_type: alert.document_type || alert.title || 'Documento',
      alert_type: mapAlertType(alert),
      message: alert.message || alert.description || '',
      expires_at: null,
      is_read: alert.is_read || false,
      created_at: alert.created_at
    }))

    // Combine and sort by date
    const allAlerts = [...formattedLogAlerts, ...formattedLegacyAlerts]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 50)

    console.log(`[v0] Fetched ${allAlerts.length} total alerts (${formattedLogAlerts.length} from alerts_log, ${formattedLegacyAlerts.length} from alerts)`)

    return NextResponse.json({ alerts: allAlerts })
  } catch (error) {
    console.error('[v0] Error in GET subcontractors/alerts:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error', alerts: [] },
      { status: 500 }
    )
  }
}
