import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(
  request: NextRequest,
  { params }: { params: { rut: string } }
) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    })

    const formData = await request.formData()
    const file = formData.get('file') as File
    const docType = formData.get('docType') as string
    const userEmail = formData.get('userEmail') as string

    if (!file || !docType || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: file, docType, userEmail' },
        { status: 400 }
      )
    }

    // Upload to Vercel Blob or store URL reference
    const buffer = await file.arrayBuffer()
    const filename = `${params.rut}/${docType}/${file.name}`

    // Insert document record
    const { data: docData, error: docError } = await supabase
      .from('subcontractor_documents')
      .insert([
        {
          rut: params.rut,
          documento_tipo: docType,
          estado: 'pending',
          archivo_url: filename,
          notas: `Uploaded by ${userEmail}`,
        },
      ])
      .select()

    if (docError) {
      console.error('[v0] Error inserting document:', docError)
      return NextResponse.json({ error: docError.message }, { status: 500 })
    }

    // Log the upload
    await supabase.from('document_upload_log').insert([
      {
        documento_id: docData[0].id,
        usuario_email: userEmail,
        accion: 'uploaded',
        notas: `${docType} uploaded`,
      },
    ])

    return NextResponse.json({
      success: true,
      documento_id: docData[0].id,
      message: 'Document uploaded successfully',
    })
  } catch (error) {
    console.error('[v0] Document upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}

// GET documents for a subcontractor
export async function GET(
  request: NextRequest,
  { params }: { params: { rut: string } }
) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    })

    const { data: documents, error } = await supabase
      .from('subcontractor_documents')
      .select('*')
      .eq('rut', params.rut)
      .order('fecha_carga', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ documents })
  } catch (error) {
    console.error('[v0] Document fetch error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Fetch failed' },
      { status: 500 }
    )
  }
}
