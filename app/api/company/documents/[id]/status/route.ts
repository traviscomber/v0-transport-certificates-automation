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
      .select('ocr_data')
      .eq('id', documentId)
      .single()

    if (getError || !doc) {
      console.warn('[v0] Document not found:', documentId)
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Preparar ocr_data con status
    const ocrData = doc.ocr_data || {}
    ocrData.status = status
    ocrData.reason = reason || 'Sin motivo especificado'
    ocrData.changed_at = new Date().toISOString()
    ocrData.changed_by = 'admin'

    // Actualizar documento con nuevo status
    const { data: updated, error: updateError } = await adminClient
      .from('documents')
      .update({
        ocr_data: ocrData,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId)
      .select()
      .single()

    if (updateError) {
      console.error('[v0] Error updating document status:', updateError)
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

    // Obtener status del documento desde ocr_data
    const { data: doc, error } = await adminClient
      .from('documents')
      .select('ocr_data')
      .eq('id', documentId)
      .single()

    if (error || !doc) {
      return NextResponse.json({
        document_id: documentId,
        status: 'pending',
        reason: null
      })
    }

    const status = doc.ocr_data?.status || 'pending'
    
    return NextResponse.json({
      document_id: documentId,
      status: status,
      reason: doc.ocr_data?.reason,
      changed_at: doc.ocr_data?.changed_at
    })
  } catch (error) {
    console.error('[v0] Error in GET /api/company/documents/[id]/status:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
