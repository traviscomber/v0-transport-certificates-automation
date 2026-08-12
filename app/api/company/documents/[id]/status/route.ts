export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { changeDocumentStatus } from '@/lib/document-status-service'
import { validateChangeStatusRequest } from '@/lib/validation/schemas'
import { canChangeDocumentStatus } from '@/lib/document-authorization'
import { requireServerActor } from '@/lib/auth/server-actor'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await requireServerActor(['admin', 'ejecutiva', 'prevencionista'])
    if (!auth.actor) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const documentId = params.id
    const validation = validateChangeStatusRequest(body)

    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.errors },
        { status: 400 },
      )
    }

    const normalizedStatus = validation.normalizedStatus!
    const authResult = await canChangeDocumentStatus(
      auth.actor.id,
      documentId,
      auth.actor.role,
      auth.actor.organizationId || undefined,
      auth.actor.email,
      body.documentType || 'conductor',
    )

    if (!authResult.allowed) {
      return NextResponse.json(
        {
          error: authResult.reason || 'No tienes permisos para cambiar este documento',
          code: 'AUTHORIZATION_DENIED',
        },
        { status: 403 },
      )
    }

    const result = await changeDocumentStatus({
      documentId,
      newStatus: normalizedStatus as 'approved' | 'rejected' | 'pending',
      reason: body.reason,
      userId: auth.actor.id,
      userEmail: auth.actor.email,
      documentType: body.documentType || 'conductor',
    })

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    console.log('[company] Verified actor changed document status:', auth.actor.id, documentId, result.newStatus)
    return NextResponse.json({
      success: true,
      document_id: documentId,
      status: result.newStatus,
      previous_status: result.previousStatus,
      message: result.message,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal error'
    console.error('[company] PATCH document status error:', message)
    return NextResponse.json({ error: message, code: 'INTERNAL_ERROR' }, { status: 500 })
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireServerActor(['admin', 'ejecutiva', 'prevencionista'])
  if (!auth.actor) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  return NextResponse.json({ document_id: params.id, status_endpoint: 'available' })
}
