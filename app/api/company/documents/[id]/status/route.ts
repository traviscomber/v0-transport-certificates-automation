import { NextRequest, NextResponse } from 'next/server'
import { changeDocumentStatus } from '@/lib/document-status-service'
import { verifyAuth } from '@/lib/auth-middleware'

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

    const { status: rawStatus, reason } = await request.json()
    const documentId = params.id

    if (!rawStatus) {
      return NextResponse.json({ error: 'Missing status parameter' }, { status: 400 })
    }

    // Use centralized status change service
    const result = await changeDocumentStatus({
      documentId,
      newStatus: rawStatus as any, // Service will validate
      reason,
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
