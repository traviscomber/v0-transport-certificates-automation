import { createAdminClient } from '@/lib/supabase/admin'
import { type NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * POST /api/alerts/{id}/action
 * Handle alert actions: approve, reject, request_info
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

    // Get current alert details
    const { data: alert, error: fetchError } = await supabase
      .from('alerts')
      .select('*')
      .eq('id', alertId)
      .single()

    if (fetchError || !alert) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      )
    }

    // Update alert with action details
    const { data: updatedAlert, error: updateError } = await supabase
      .from('alerts')
      .update({
        status: 'actioned',
        action_type: action,
        action_notes: notes || '',
        actioned_by: request.headers.get('x-ejecutiva-name') || 'Sistema',
        actioned_at: new Date().toISOString(),
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
    if (alert.metadata?.document_id) {
      const documentId = alert.metadata.document_id

      let newStatus = 'pendiente'
      if (action === 'approve') {
        newStatus = 'aprobado'
      } else if (action === 'reject') {
        newStatus = 'rechazado'
      } else if (action === 'request_info') {
        newStatus = 'pendiente' // Stays pending, waiting for more info
      }

      // Update document status (assuming table is 'uploaded_documents' or similar)
      await supabase
        .from('uploaded_documents')
        .update({ estado: newStatus })
        .eq('id', documentId)
        .select()

      // Create a follow-up alert for the action result
      const actionTitles = {
        approve: 'Documento Aprobado',
        reject: 'Documento Rechazado',
        request_info: 'Información Solicitada',
      }

      await supabase.from('alerts').insert([
        {
          title: actionTitles[action as keyof typeof actionTitles],
          message: `${actionTitles[action as keyof typeof actionTitles]} por ${request.headers.get('x-ejecutiva-name') || 'Ejecutiva'}.`,
          type: `DOCUMENT_${newStatus.toUpperCase()}`,
          priority: action === 'reject' ? 'high' : 'medium',
          category: 'DOCUMENT_ACTION',
          transportista_id: alert.transportista_id,
          subcontratista_id: alert.subcontratista_id,
          ejecutiva_nombre: alert.ejecutiva_nombre,
          status: 'resuelto',
          metadata: {
            ...alert.metadata,
            action_taken: action,
            actioned_by: request.headers.get('x-ejecutiva-name') || 'Sistema',
            parent_alert_id: alertId,
          },
        },
      ])
    }

    return NextResponse.json({
      success: true,
      alert: updatedAlert,
      message: `Acción "${action}" completada exitosamente`,
    })
  } catch (error) {
    console.error('[v0] Error in alert action handler:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process alert action' },
      { status: 500 }
    )
  }
}
