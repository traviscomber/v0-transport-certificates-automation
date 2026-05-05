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
      console.log('[v0] STATUS ENDPOINT - Auth failed:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[v0] STATUS ENDPOINT - Auth successful:', { 
      userId: user.id, 
      email: user.email, 
      role: user.role, 
      org_id: user.organization_id
    })

    const body = await request.json()
    const documentId = params.id

    console.log('[v0] STATUS ENDPOINT - Request:', { documentId, newStatus: body.status })

    // Validate request body
    const validation = validateChangeStatusRequest(body)
    if (!validation.valid) {
      console.log('[v0] STATUS ENDPOINT - Validation failed:', validation.errors)
      return NextResponse.json({ 
        error: 'Invalid request', 
        details: validation.errors 
      }, { status: 400 })
    }

    // Check authorization - verify user can change this document's status
    console.log('[v0] STATUS ENDPOINT - Calling canChangeDocumentStatus...')
    const authResult = await canChangeDocumentStatus(
      user.id,
      documentId,
      user.role,
      user.organization_id
    )

    console.log('[v0] STATUS ENDPOINT - Authorization result:', authResult)

    if (!authResult.allowed) {
      console.log('[v0] STATUS ENDPOINT - AUTHORIZATION DENIED:', authResult.reason)
      return NextResponse.json(
        { error: authResult.reason || 'No tienes permisos para cambiar este documento' },
        { status: 403 }
      )
    }

    console.log('[v0] STATUS ENDPOINT - AUTHORIZATION APPROVED, changing status...')

    // Use centralized status change service
    const result = await changeDocumentStatus({
      documentId,
      newStatus: body.status,
      reason: body.reason,
      userId: user.id
    })

    if (!result.success) {
      console.log('[v0] STATUS ENDPOINT - Status change failed:', result.message)
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    console.log('[v0] STATUS ENDPOINT - Status change successful:', { documentId, newStatus: result.newStatus })
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
