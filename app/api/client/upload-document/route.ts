import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'
import { generateDocumentUploadAlerts } from '@/lib/document-alerts-generator'

export const maxDuration = 30

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { message: 'No authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const documentType = formData.get('documentType') as string
    const clientId = formData.get('clientId') as string

    if (!file || !documentType) {
      return NextResponse.json(
        { message: 'Missing file or documentType' },
        { status: 400 }
      )
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { message: 'File too large' },
        { status: 400 }
      )
    }

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { message: 'Invalid file type' },
        { status: 400 }
      )
    }

    // Get client info
    const { data: clientProfile, error: clientError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', clientId || user.id)
      .single()

    if (clientError || !clientProfile) {
      return NextResponse.json(
        { message: 'Client profile not found' },
        { status: 404 }
      )
    }

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

    const fileExtension = file.name.split('.').pop()
    const fileName = `${uuidv4()}.${fileExtension}`
    const filePath = `client-documents/${clientId || user.id}/${fileName}`

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

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath)

    const { data: uploadedDoc, error: dbError } = await supabase
      .from('uploaded_documents')
      .insert({
        document_type_id: docType.id,
        client_id: clientId || user.id,
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
      await supabase.storage.from('documents').remove([filePath])
      return NextResponse.json(
        { message: 'Failed to save document record' },
        { status: 500 }
      )
    }

    // Notification for uploader
    await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        title: 'Documento Subido',
        message: `Tu ${docType.name} ha sido recibido y se validará en breve.`,
        type: 'info',
        metadata: {
          document_id: uploadedDoc.id,
          document_type: documentType,
        },
      })

    // Generate alerts for admins about the new client document
    await generateDocumentUploadAlerts(
      uploadedDoc.id,
      docType.name,
      clientProfile.company_name || clientProfile.first_name || 'Cliente',
      'client',
      clientId || user.id
    )

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
