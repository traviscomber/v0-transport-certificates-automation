import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { triggerDocumentStatusAlert } from '@/lib/operations/alert-triggers'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status: rawStatus, reason } = await request.json()
    const adminClient = await createAdminClient()
    const documentId = params.id

    // Map Spanish status values to English
    const statusMap: Record<string, string> = {
      'aprobado': 'approved',
      'rechazado': 'rejected',
      'pendiente': 'pending',
      'vencido': 'expired',
      'approved': 'approved',
      'rejected': 'rejected',
      'pending': 'pending',
      'expired': 'expired'
    }

    const status = statusMap[rawStatus?.toLowerCase()]

    if (!status) {
      console.error('[v0] Invalid status value:', rawStatus)
      return NextResponse.json({ error: 'Invalid status', receivedStatus: rawStatus }, { status: 400 })
    }

    console.log('[v0] Changing document status:', { documentId, status, reason })

    // Upsert status en document_statuses
    const { data: statusRecord, error: upsertError } = await adminClient
      .from('document_statuses')
      .upsert({
        document_id: documentId,
        status: status,
        reason: reason || 'Sin motivo especificado',
        changed_at: new Date().toISOString(),
        changed_by: 'admin'
      })
      .select()

    console.log('[v0] Upsert result:', { error: upsertError?.message, errorCode: upsertError?.code, data: statusRecord })

    if (upsertError) {
      console.error('[v0] ❌ Error upserting document status:', {
        message: upsertError.message,
        code: upsertError.code,
        details: upsertError.details,
        hint: upsertError.hint
      })
      return NextResponse.json({ 
        error: 'Failed to update status', 
        details: upsertError.message,
        code: upsertError.code
      }, { status: 500 })
    }

    console.log('[v0] Document status updated to:', status)

    // Trigger alert for status change
    if (['approved', 'rejected', 'expired'].includes(status)) {
      try {
        await triggerDocumentStatusAlert(
          documentId,
          status as 'approved' | 'rejected' | 'expired',
          `Document ${documentId}`,
          reason || 'Sin especificar'
        )
      } catch (alertError) {
        console.error('[v0] Error triggering alert:', alertError)
        // Don't fail the request if alert triggering fails
      }
    }

    return NextResponse.json({
      success: true,
      document_id: documentId,
      status: status,
      message: `Estado del documento cambiado a ${status}`,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('[v0] Error in PATCH /api/company/documents/[id]/status:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminClient = await createAdminClient()
    const documentId = params.id

    // Obtener status de document_statuses
    const { data: statusRecord, error } = await adminClient
      .from('document_statuses')
      .select('*')
      .eq('document_id', documentId)
      .single()

    if (error || !statusRecord) {
      return NextResponse.json({
        document_id: documentId,
        status: 'pending',
        reason: null
      })
    }

    return NextResponse.json({
      document_id: documentId,
      status: statusRecord.status,
      reason: statusRecord.reason,
      changed_at: statusRecord.changed_at,
      changed_by: statusRecord.changed_by
    })
  } catch (error) {
    console.error('[v0] Error in GET /api/company/documents/[id]/status:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
