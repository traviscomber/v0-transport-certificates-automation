import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// In-memory store for document statuses (in production, use a database table)
const documentStatuses: Record<string, { status: string; reason?: string; timestamp: string; changed_by: string }> = {}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status, reason } = await request.json()
    const documentId = params.id

    if (!['pending', 'approved', 'rejected', 'expired'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    console.log('[v0] Changing document status:', { documentId, status, reason })

    // Store the status change
    documentStatuses[documentId] = {
      status,
      reason: reason || 'Sin motivo especificado',
      timestamp: new Date().toISOString(),
      changed_by: 'admin'
    }

    console.log('[v0] Document status updated:', status)

    return NextResponse.json({
      success: true,
      document_id: documentId,
      status: status,
      message: `Estado del documento cambiado a ${status}`,
      timestamp: documentStatuses[documentId].timestamp
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
    const documentId = params.id
    const statusInfo = documentStatuses[documentId] || { status: 'pending', timestamp: null }
    
    return NextResponse.json({
      document_id: documentId,
      status: statusInfo.status,
      reason: statusInfo.reason,
      timestamp: statusInfo.timestamp
    })
  } catch (error) {
    console.error('[v0] Error in GET /api/company/documents/[id]/status:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
