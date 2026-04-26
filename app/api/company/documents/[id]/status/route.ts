import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { triggerDocumentStatusAlert } from '@/lib/operations/alert-triggers'
import { allDriversData } from '@/lib/data/all-drivers'

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

    // Map back to Spanish for driver_documents.status column
    const spanishStatusMap: Record<string, string> = {
      'approved': 'aprobado',
      'rejected': 'rechazado',
      'pending': 'pendiente',
      'expired': 'vencido',
      'deleted': 'eliminado'
    }
    const spanishStatus = spanishStatusMap[status] || status

    // Always update driver_documents.status directly so the UI syncs
    const { error: directUpdateError } = await adminClient
      .from('driver_documents')
      .update({ status: spanishStatus })
      .eq('id', documentId)

    if (directUpdateError) {
      console.error('[v0] Error updating driver_documents.status:', directUpdateError)
    } else {
      console.log('[v0] ✅ driver_documents.status updated to:', spanishStatus)
    }

    // Also update document_statuses table (for audit trail)
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
      console.error('[v0] Update error on document_statuses:', updateError)
    } else if (updateResult && updateResult.length > 0) {
      console.log('[v0] ✅ document_statuses updated:', { documentId, status })
      
      // Get document details for alert
      const { data: document } = await adminClient
        .from('driver_documents')
        .select('file_name, document_type, driver_id')
        .eq('id', documentId)
        .single()
      
      // Find driver info from local data
      let driverName = 'Un conductor'
      if (document?.driver_id) {
        const driver = allDriversData.find(d => d.id === String(document.driver_id) || d.rut === String(document.driver_id))
        if (driver) {
          driverName = `${driver.nombres} ${driver.apellidos}`
        }
      }
      
      // Trigger alert for status change
      if (status === 'approved' || status === 'rejected' || status === 'expired') {
        try {
          await triggerDocumentStatusAlert(
            documentId,
            status as 'approved' | 'rejected' | 'expired',
            document?.document_type || `Documento ${documentId}`,
            reason
          )
          console.log('[v0] ✅ Alert triggered for status change:', status)
        } catch (alertError) {
          console.warn('[v0] Error triggering alert:', alertError)
        }
      }
      
      return NextResponse.json({
        success: true,
        document_id: documentId,
        status: status,
        message: `Estado actualizado a ${status}`,
        timestamp: new Date().toISOString()
      })
    }

    // If no rows updated in document_statuses, try to insert new status
    console.log('[v0] No existing status row, inserting new one...')
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
    
    // Get document details for alert
    const { data: document } = await adminClient
      .from('driver_documents')
      .select('file_name, document_type, driver_id')
      .eq('id', documentId)
      .single()
    
    // Find driver info from local data
    let driverName = 'Un conductor'
    if (document?.driver_id) {
      const driver = allDriversData.find(d => d.id === String(document.driver_id) || d.rut === String(document.driver_id))
      if (driver) {
        driverName = `${driver.nombres} ${driver.apellidos}`
      }
    }
    
    // Trigger alert for new status
    if (status === 'approved' || status === 'rejected' || status === 'expired') {
      try {
        await triggerDocumentStatusAlert(
          documentId,
          status as 'approved' | 'rejected' | 'expired',
          document?.document_type || `Documento ${documentId}`,
          reason
        )
        console.log('[v0] ✅ Alert triggered for new status:', status)
      } catch (alertError) {
        console.warn('[v0] Error triggering alert:', alertError)
      }
    }
    
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
