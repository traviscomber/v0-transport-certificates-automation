import { createAdminClient } from '@/lib/supabase/admin'
import { type NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * POST /api/alerts/{id}/action
 * Handle alert actions: approve, reject, request_info
 * Production-ready: uses alerts_log table
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const alertId = params.id
    const body = await request.json()
    const { action, notes } = body

    if (!alertId || !action) {
      return NextResponse.json(
        { error: 'Missing alertId or action' },
        { status: 400 }
      )
    }

    // Validate action type
    if (!['approve', 'reject', 'request_info'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action type' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const ejecutivaName = request.headers.get('x-ejecutiva-name') || 'Sistema'

    // Get current alert details from alerts table (unified table)
    const { data: alert, error: fetchError } = await supabase
      .from('alerts')
      .select('*')
      .eq('id', alertId)
      .single()

    if (fetchError || !alert) {
      console.error('[v0] Alert not found:', alertId, fetchError)
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      )
    }

    // Update alert with action details
    const { data: updatedAlert, error: updateError } = await supabase
      .from('alerts')
      .update({
        status: action === 'request_info' ? 'pendiente' : 'resuelto',
        action_type: action,
        action_notes: notes || '',
        actioned_by: ejecutivaName,
        actioned_at: new Date().toISOString(),
        is_resolved: action !== 'request_info',
      })
      .eq('id', alertId)
      .select()
      .single()

    if (updateError) {
      console.error('[v0] Error updating alert:', updateError)
      return NextResponse.json(
        { error: 'Failed to update alert' },
        { status: 500 }
      )
    }

    // If there's a related document, update its state based on action
    const documentId = alert.document_id || alert.metadata?.document_id
    if (documentId) {
      let newStatus = 'pendiente'
      if (action === 'approve') {
        newStatus = 'aprobado'
      } else if (action === 'reject') {
        newStatus = 'rechazado'
      }

      // Try multiple document tables since the system has multiple
      const docTables = ['driver_documents', 'documents', 'uploaded_documents']
      for (const table of docTables) {
        try {
          await supabase
            .from(table)
            .update({ status: newStatus, estado: newStatus })
            .eq('id', documentId)
        } catch {
          // Table might not exist or column might be different - continue
        }
      }

      // Create a follow-up alert tracking the action
      const actionTitles = {
        approve: 'Documento Aprobado',
        reject: 'Documento Rechazado',
        request_info: 'Informacion Solicitada',
      }

      await supabase.from('alerts').insert([
        {
          alert_type: action === 'reject' ? 'error' : action === 'approve' ? 'success' : 'info',
          title: actionTitles[action as keyof typeof actionTitles],
          description: `${actionTitles[action as keyof typeof actionTitles]} por ${ejecutivaName}. ${notes ? `Notas: ${notes}` : ''}`,
          message: `${actionTitles[action as keyof typeof actionTitles]} por ${ejecutivaName}. ${notes ? `Notas: ${notes}` : ''}`,
          priority: action === 'reject' ? 'high' : 'low',
          entity_type: 'document',
          entity_id: documentId,
          entity_name: alert.entity_name,
          ejecutiva_nombre: alert.ejecutiva_nombre,
          transportista_id: alert.transportista_id,
          subcontratista_id: alert.subcontratista_id,
          driver_id: alert.driver_id,
          document_id: documentId,
          document_type: alert.document_type,
          status: 'resuelto',
          is_read: false,
          is_resolved: true,
          metadata: {
            ...alert.metadata,
            action_taken: action,
            actioned_by: ejecutivaName,
            parent_alert_id: alertId,
          },
        },
      ])
    }

    return NextResponse.json({
      success: true,
      alert: updatedAlert,
      message: `Accion "${action}" completada exitosamente`,
    })
  } catch (error) {
    console.error('[v0] Error in alert action handler:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process alert action' },
      { status: 500 }
    )
  }
}
