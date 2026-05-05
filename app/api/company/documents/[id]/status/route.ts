import { NextRequest, NextResponse } from 'next/server'
import { changeDocumentStatus } from '@/lib/document-status-service'
import { verifyAuth } from '@/lib/auth-middleware'
import { validateChangeStatusRequest } from '@/lib/validation/schemas'
import { canChangeDocumentStatus } from '@/lib/document-authorization'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const { user, error: authError } = await verifyAuth(request)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const documentId = params.id

    // Validate request body
    const validation = validateChangeStatusRequest(body)
    if (!validation.valid) {
      return NextResponse.json({ 
        error: 'Invalid request', 
        details: validation.errors 
      }, { status: 400 })
    }

    // Check authorization - verify user can change this document's status
    const authResult = await canChangeDocumentStatus(
      user.id,
      documentId,
      user.role,
      user.organization_id
    )

    if (!authResult.allowed) {
      return NextResponse.json(
        { error: authResult.reason || 'No tienes permisos para cambiar este documento' },
        { status: 403 }
      )
    }

    // Use centralized status change service
    const result = await changeDocumentStatus({
      documentId,
      newStatus: body.status,
      reason: body.reason,
      userId: user.id
    })

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      document_id: documentId,
      status: result.newStatus,
      previous_status: result.previousStatus,
      message: result.message,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[v0] PATCH /status error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error: authError } = await verifyAuth(request)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return document ID and placeholder - actual status is fetched client-side
    return NextResponse.json({ 
      document_id: params.id, 
      status_endpoint: `available`
    })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
