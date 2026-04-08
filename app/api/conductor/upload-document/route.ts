import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

// Set max duration for the route (30 seconds - Vercel free plan limit)
export const maxDuration = 30

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    // Get the current user
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { message: 'No authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verify token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const documentType = formData.get('documentType') as string

    if (!file || !documentType) {
      return NextResponse.json(
        { message: 'Missing file or documentType' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { message: 'File too large' },
        { status: 400 }
      )
    }

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { message: 'Invalid file type' },
        { status: 400 }
      )
    }

    // Get conductor info from user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { message: 'User profile not found' },
        { status: 404 }
      )
    }

    // Get document type info
    const { data: docType, error: docTypeError } = await supabase
      .from('document_types')
      .select('*')
      .eq('code', documentType)
      .single()

    if (docTypeError || !docType) {
      return NextResponse.json(
        { message: 'Invalid document type' },
        { status: 400 }
      )
    }

    // Generate file path
    const fileExtension = file.name.split('.').pop()
    const fileName = `${uuidv4()}.${fileExtension}`
    const filePath = `conductor-documents/${user.id}/${fileName}`

    // Upload file to storage
    const fileBuffer = await file.arrayBuffer()
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json(
        { message: 'Failed to upload file' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath)

    // Create uploaded_documents record
    const { data: uploadedDoc, error: dbError } = await supabase
      .from('uploaded_documents')
      .insert({
        document_type_id: docType.id,
        conductor_id: profile.id,
        uploaded_by: user.id,
        original_filename: file.name,
        file_url: publicUrl,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        validation_status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      // Try to clean up storage
      await supabase.storage.from('documents').remove([filePath])
      return NextResponse.json(
        { message: 'Failed to save document record' },
        { status: 500 }
      )
    }

    // Create notification
    await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        title: 'Documento Subido',
        message: `Tu ${docType.name} ha sido recibido y se procesará en breve.`,
        type: 'info',
        metadata: {
          document_id: uploadedDoc.id,
          document_type: documentType,
        },
      })

    // Optionally trigger OCR processing (would be handled by a background job)
    // You could emit an event or call another service here

    return NextResponse.json(
      {
        success: true,
        documentId: uploadedDoc.id,
        message: 'Document uploaded successfully',
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
