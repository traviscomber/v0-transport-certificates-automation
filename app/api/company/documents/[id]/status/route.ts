import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status: rawStatus, reason } = await request.json()
    console.log('[v0] PATCH /status called with:', { documentId: params.id, rawStatus, reason })
    
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
      'expired': 'expired',
      'eliminar': 'deleted',
      'deleted': 'deleted'
    }

    const status = statusMap[rawStatus?.toLowerCase()]

    if (!status) {
      console.error('[v0] Invalid status value:', rawStatus)
      return NextResponse.json({ error: 'Invalid status', receivedStatus: rawStatus }, { status: 400 })
    }

    console.log('[v0] Mapped status to:', status)

    // Try to update existing status
    const { data: updateResult, error: updateError } = await adminClient
      .from('document_statuses')
      .update({
        status: status,
        reason: reason || 'Sin motivo especificado',
        changed_at: new Date().toISOString(),
        changed_by: 'admin'
      })
      .eq('document_id', documentId)
      .select()

    if (updateError) {
      console.error('[v0] Update error:', updateError)
    } else if (updateResult && updateResult.length > 0) {
      console.log('[v0] ✅ Document status updated:', { documentId, status })
      return NextResponse.json({
        success: true,
        document_id: documentId,
        status: status,
        message: `Estado actualizado a ${status}`,
        timestamp: new Date().toISOString()
      })
    }

    // If no rows updated, try to insert new status
    console.log('[v0] No existing status, inserting new one...')
    const { data: insertResult, error: insertError } = await adminClient
      .from('document_statuses')
      .insert({
        document_id: documentId,
        status: status,
        reason: reason || 'Sin motivo especificado',
        changed_at: new Date().toISOString(),
        changed_by: 'admin'
      })
      .select()

    if (insertError) {
      console.error('[v0] ❌ Insert error:', {
        message: insertError.message,
        code: insertError.code,
        details: insertError.details
      })
      return NextResponse.json({ 
        error: 'Failed to save status', 
        details: insertError.message
      }, { status: 500 })
    }

    console.log('[v0] ✅ Document status inserted:', { documentId, status })
    return NextResponse.json({
      success: true,
      document_id: documentId,
      status: status,
      message: `Estado creado: ${status}`,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('[v0] Exception in PATCH /status:', error)
    const errorMsg = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: 'Server error', details: errorMsg },
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
