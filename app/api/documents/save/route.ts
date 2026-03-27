import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { documentType, fileName, extractedData, confidence } = await req.json()

    // Validate required fields
    if (!documentType || !fileName || !extractedData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    // Get authenticated user
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.slice(7)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      )
    }

    // Save document to Supabase
    const { data, error } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        document_type: documentType,
        file_name: fileName,
        extracted_data: extractedData,
        confidence,
        status: 'processed',
        created_at: new Date().toISOString(),
      })
      .select()

    if (error) {
      console.error('[v0] Supabase insert error:', error)
      return NextResponse.json(
        { error: 'Failed to save document' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      document: data?.[0],
    })
  } catch (error) {
    console.error('[v0] Save document error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
