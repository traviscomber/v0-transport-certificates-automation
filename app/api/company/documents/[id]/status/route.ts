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

    // Upsert status en document_statuses
    const { data: statusRecord, error: upsertError } = await adminClient
      .from('document_statuses')
      .upsert({
        document_id: documentId,
        status: status,
        reason: reason || 'Sin motivo especificado',
        changed_at: new Date().toISOString(),
        changed_by: 'admin'
      }, {
        onConflict: 'document_id'
      })
      .select()
      .single()

    if (upsertError) {
      console.error('[v0] Error upserting document status:', upsertError)
      return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
    }

    console.log('[v0] Document status updated to:', status)

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
    const adminClient = createAdminClient()
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
