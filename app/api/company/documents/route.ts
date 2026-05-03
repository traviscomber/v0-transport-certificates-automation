import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const adminClient = createAdminClient()

    const { data: documents, error } = await adminClient
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[v0] Error fetching documents:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(documents || [])
  } catch (error) {
    console.error('[v0] Error getting documents:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error fetching documents' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fileName, fileSize, fileType, documentType } = body

    const adminClient = createAdminClient()

    const { data: document, error } = await adminClient
      .from('documents')
      .insert({
        file_name: fileName,
        file_size: fileSize,
        file_type: fileType,
        document_type: documentType,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, document })
  } catch (error) {
    console.error('[v0] Error creating document:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error creating document' },
      { status: 500 }
    )
  }
}
