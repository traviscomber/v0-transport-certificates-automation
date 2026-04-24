import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = params.id
    const adminClient = createAdminClient()

    console.log('[v0] Deleting document from storage:', documentId)

    // El documentId es el path del archivo en storage
    // Formato: drivers/RUT/timestamp_filename.jpg
    const { error: deleteError } = await adminClient.storage
      .from('documents')
      .remove([documentId])

    if (deleteError) {
      console.error('[v0] Storage delete error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete document from storage' },
        { status: 500 }
      )
    }

    console.log('[v0] Document deleted successfully:', documentId)

    return NextResponse.json({
      success: true,
      document_id: documentId,
      message: 'Document deleted successfully'
    })
  } catch (error) {
    console.error('[v0] Error in DELETE /api/company/documents/[id]/delete:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    )
  }
}
