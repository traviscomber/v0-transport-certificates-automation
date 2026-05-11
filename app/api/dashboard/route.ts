import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse, NextRequest } from "next/server"
import { verifyAuth } from "@/lib/auth-middleware"

export const dynamic = 'force-dynamic'
export const revalidate = 30 // ISR: revalidate every 30 seconds

/**
 * GET /api/dashboard
 * Consolidated endpoint combining stats + alerts in a single request
 * This reduces 2 API calls to 1, improving dashboard load performance
 * Cached for 30s with stale-while-revalidate
 */
export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await verifyAuth(request)
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()
    const url = new URL(request.url)
    const alertLimit = parseInt(url.searchParams.get('alertLimit') || '50')

    // Fetch document stats
    const { data: conductorDocs } = await supabase
      .from('uploaded_documents')
      .select('validation_status', { count: 'exact', head: false })

    const pendingCount = (conductorDocs || []).filter(d => 
      d.validation_status === 'pending' || d.validation_status === null
    ).length

    const conductorStats = {
      total: conductorDocs?.length || 0,
      pendientes: pendingCount,
      aprobados: (conductorDocs || []).filter(d => d.validation_status === 'approved').length,
      rechazados: (conductorDocs || []).filter(d => d.validation_status === 'rejected').length,
    }

    // Fetch alerts from alerts table
    const { data: rawAlerts } = await supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(alertLimit)

    // Normalize alerts
    const alerts: any[] = (rawAlerts || []).map((a: any) => ({
      id: a.id,
      type: a.alert_type || 'info',
      title: a.title,
      message: a.message || a.description || '',
      priority: a.priority || 'medium',
      is_read: a.is_read ?? false,
      is_dismissed: a.is_resolved ?? false,
      created_at: a.created_at,
      metadata: a.metadata || {},
      source: 'alerts_table'
    }))

    // Fetch recent document uploads
    const { data: recentDocs } = await supabase
      .from('uploaded_documents')
      .select('*')
      .order('uploaded_at', { ascending: false })
      .limit(alertLimit)

    for (const doc of recentDocs || []) {
      alerts.push({
        id: `doc_${doc.id}`,
        type: 'DOCUMENT_UPLOADED',
        title: 'Documento Subido',
        message: `${doc.document_type} - ${doc.driver_name || 'Desconocido'}`,
        priority: 'medium',
        is_read: false,
        is_dismissed: false,
        created_at: doc.uploaded_at,
        metadata: { document_id: doc.id, document_type: doc.document_type },
        source: 'document_upload'
      })
    }

    // Fetch anomalies
    const { data: anomalies } = await supabase
      .from('anomalies_with_document_details')
      .select('*')
      .order('detected_at', { ascending: false })
      .limit(alertLimit)

    for (const anomaly of anomalies || []) {
      alerts.push({
        id: `anomaly_${anomaly.id}`,
        type: 'ANOMALY_DETECTED',
        title: `Anomalía Detectada - ${anomaly.anomaly_type}`,
        message: `${anomaly.description}. Conductor: ${anomaly.driver_name || 'Desconocido'}`,
        priority: anomaly.severity === 'critical' ? 'high' : 'medium',
        is_read: false,
        is_dismissed: anomaly.action_taken ? true : false,
        created_at: anomaly.detected_at,
        metadata: { anomaly_id: anomaly.id, anomaly_type: anomaly.anomaly_type },
        source: 'anomaly_detection'
      })
    }

    // Sort alerts by date and limit
    const sortedAlerts = alerts
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, alertLimit)

    const response = NextResponse.json({
      stats: {
        conductores: conductorStats,
      },
      alerts: sortedAlerts,
      timestamp: new Date().toISOString()
    })

    // Set cache headers for optimal performance
    response.headers.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=60')
    response.headers.set('Content-Type', 'application/json')

    return response

  } catch (error) {
    console.error('[v0] Dashboard endpoint error:', error instanceof Error ? error.message : error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error fetching dashboard data' },
      { status: 500 }
    )
  }
}
