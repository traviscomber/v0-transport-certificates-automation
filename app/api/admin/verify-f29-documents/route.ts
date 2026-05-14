import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Missing Supabase credentials' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Find F29 type
    const { data: docTypes } = await supabase
      .from('subcontractor_document_types')
      .select('id, code, nombre')

    const f29Type = docTypes?.find(dt => dt.code === 'F29')

    if (!f29Type) {
      return NextResponse.json({
        success: false,
        message: 'F29 type not found',
      })
    }

    // Get all documents with F29 type (approved ones)
    const { data: f29Docs } = await supabase
      .from('subcontractor_documents')
      .select('id, file_name, status, approved_at')
      .eq('document_type_id', f29Type.id)
      .limit(100)

    return NextResponse.json({
      success: true,
      f29_type: f29Type,
      f29_documents_count: f29Docs?.length || 0,
      sample_f29_documents: f29Docs?.slice(0, 10) || [],
      approved_count: f29Docs?.filter(d => d.status === 'approved').length || 0,
    })
  } catch (error: any) {
    console.error('[v0] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
