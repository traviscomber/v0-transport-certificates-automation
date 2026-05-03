import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const conductorId = cookieStore.get('conductor_id')?.value

    if (!conductorId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { message: 'Server configuration missing' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get document and verify it belongs to the conductor
    const { data: document, error } = await supabase
      .from('uploaded_documents')
      .select('*')
      .eq('id', params.id)
      .eq('conductor_id', conductorId)
      .single()

    if (error || !document) {
      return NextResponse.json(
        { message: 'Document not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, document }, { status: 200 })
  } catch (error) {
    console.error('[v0] GET document error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const conductorId = cookieStore.get('conductor_id')?.value

    if (!conductorId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { message: 'Server configuration missing' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify document belongs to conductor
    const { data: existingDoc, error: checkError } = await supabase
      .from('uploaded_documents')
      .select('*')
      .eq('id', params.id)
      .eq('conductor_id', conductorId)
      .single()

    if (checkError || !existingDoc) {
      return NextResponse.json(
        { message: 'Document not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const updateData: any = {}

    // Allow updating specific fields
    if (body.validation_status !== undefined) {
      updateData.validation_status = body.validation_status
    }
    if (body.notes !== undefined) {
      updateData.notes = body.notes
    }

    const { data: updatedDoc, error: updateError } = await supabase
      .from('uploaded_documents')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      console.error('[v0] Update error:', updateError)
      return NextResponse.json(
        { message: 'Failed to update document' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, document: updatedDoc }, { status: 200 })
  } catch (error) {
    console.error('[v0] PUT document error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const conductorId = cookieStore.get('conductor_id')?.value

    if (!conductorId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { message: 'Server configuration missing' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get document to delete file from storage
    const { data: document, error: fetchError } = await supabase
      .from('uploaded_documents')
      .select('*')
      .eq('id', params.id)
      .eq('conductor_id', conductorId)
      .single()

    if (fetchError || !document) {
      return NextResponse.json(
        { message: 'Document not found' },
        { status: 404 }
      )
    }

    // Delete file from storage if it exists
    if (document.file_path) {
      await supabase.storage
        .from('documents')
        .remove([document.file_path])
        .catch(err => console.error('[v0] Storage deletion error:', err))
    }

    // Delete document record from database
    const { error: deleteError } = await supabase
      .from('uploaded_documents')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      console.error('[v0] Delete error:', deleteError)
      return NextResponse.json(
        { message: 'Failed to delete document' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Document deleted' }, { status: 200 })
  } catch (error) {
    console.error('[v0] DELETE document error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
