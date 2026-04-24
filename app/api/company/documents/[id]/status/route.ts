import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status, reason } = await request.json()
    const adminClient = createAdminClient()
    const documentId = params.id

    if (!['pending', 'approved', 'rejected', 'expired'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    console.log('[v0] Changing document status:', { documentId, status, reason })

    // Obtener documento actual
    const { data: doc, error: getError } = await adminClient
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (getError || !doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Preparar audit log
    const auditLog = doc.audit_log || []
    auditLog.push({
      timestamp: new Date().toISOString(),
      action: 'status_change',
      old_status: doc.status,
      new_status: status,
      reason: reason || 'No reason provided',
      changed_by: 'admin'
    })

    // Actualizar documento
    const { data: updated, error: updateError } = await adminClient
      .from('documents')
      .update({
        status: status,
        audit_log: auditLog,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId)
      .select()
      .single()

    if (updateError) {
      console.error('[v0] Error updating document status:', updateError)
      return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
    }

    console.log('[v0] Document status updated:', status)

    return NextResponse.json({
      success: true,
      document: updated,
      message: `Document status changed to ${status}`
    })
  } catch (error) {
    console.error('[v0] Error in PATCH /api/company/documents/[id]/status:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    )
  }
}
