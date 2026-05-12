import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/subcontractors/alerts
 * Fetch all document-related alerts for display in dashboard
 */
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient()

    // Get all active document alerts with subcontractor info
    const { data: alerts, error } = await supabase
      .from('subcontractor_document_alerts')
      .select(`
        id,
        subcontractor_id,
        alert_type,
        message,
        is_read,
        transportistas (
          id,
          razon_social,
          rut
        ),
        subcontractor_documents (
          id,
          file_name,
          expires_at,
          status
        )
      `)
      .eq('dismissed_at', null)
      .eq('transportistas.is_active', true)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      console.error('[v0] Error fetching alerts:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get document type names
    const { data: docTypes, error: docTypesError } = await supabase
      .from('subcontractor_document_types')
      .select('id, nombre')

    if (docTypesError) {
      console.warn('[v0] Error fetching document types:', docTypesError)
    }

    // Map document type IDs to names
    const docTypeMap = new Map(docTypes?.map((dt: any) => [dt.id, dt.nombre]) || [])

    // Format alerts for frontend
    const formattedAlerts = alerts?.map((alert: any) => ({
      id: alert.id,
      subcontractor_id: alert.subcontractor_id,
      subcontractor_name: alert.transportistas?.razon_social || 'N/A',
      document_type: alert.subcontractor_documents?.[0]?.file_name || 'Documento',
      alert_type: alert.alert_type,
      message: alert.message,
      expires_at: alert.subcontractor_documents?.[0]?.expires_at,
      is_read: alert.is_read,
      created_at: alert.created_at
    })) || []

    console.log(`[v0] Fetched ${formattedAlerts.length} document alerts`)

    return NextResponse.json({ alerts: formattedAlerts })
  } catch (error) {
    console.error('[v0] Error in GET alerts:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error', alerts: [] },
      { status: 500 }
    )
  }
}
