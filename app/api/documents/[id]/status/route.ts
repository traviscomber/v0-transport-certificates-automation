import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { changeDocumentStatus } from "@/lib/document-status-service"

/**
 * DEPRECATED: Use PATCH /api/company/documents/[id]/status instead
 * 
 * This endpoint is kept for backward compatibility but should not be used
 * in new code. All new implementations should use the centralized status
 * service via /api/company/documents/[id]/status
 */

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.warn('[v0] DEPRECATED: PUT /api/documents/[id]/status is deprecated. Use PATCH /api/company/documents/[id]/status instead.')

  try {
    const { validation_status } = await request.json()

    if (!validation_status) {
      return NextResponse.json(
        { message: 'Missing validation_status' },
        { status: 400 }
      )
    }

    // Use the centralized service
    const result = await changeDocumentStatus({
      documentId: params.id,
      newStatus: validation_status,
      userId: undefined
    })

    if (!result.success) {
      return NextResponse.json(
        { message: result.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      document_id: params.id,
      status: result.newStatus,
      deprecated: true,
      message: 'This endpoint is deprecated. Please use PATCH /api/company/documents/[id]/status'
    }, { status: 200 })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { message: msg },
      { status: 500 }
    )
  }
}
