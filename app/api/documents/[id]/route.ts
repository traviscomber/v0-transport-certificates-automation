import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const documentId = params.id

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Try to fetch from uploaded_documents table first
    const { data, error } = await supabase
      .from('uploaded_documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is expected if it's not an uploaded document
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (data) {
      return NextResponse.json(data, { status: 200 })
    }

    // If not found in uploaded_documents, return 404
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch document' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = params.id

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Get the document to find the file path
    const { data: doc, error: getError } = await supabase
      .from('subcontractor_documents')
      .select('archivo_url')
      .eq('id', documentId)
      .single()

    if (getError || !doc) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Delete from storage if file path exists
    if (doc.archivo_url) {
      await supabase.storage
        .from('documents')
        .remove([doc.archivo_url])
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('subcontractor_documents')
      .delete()
      .eq('id', documentId)

    if (deleteError) {
      return NextResponse.json(
        { error: `Delete error: ${deleteError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error deleting document:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete document' },
      { status: 500 }
    )
  }
}
