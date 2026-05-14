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

    // Get all document types
    const { data: docTypes } = await supabase
      .from('subcontractor_document_types')
      .select('id, code, nombre')

    // Get sample of subcontractor documents with their types
    const { data: docs } = await supabase
      .from('subcontractor_documents')
      .select('id, file_name, document_type_id, status')
      .limit(10)

    // Map the types
    const typeMap = new Map(docTypes?.map(dt => [dt.id, dt]) || [])

    // Enrich documents with type info
    const docsWithTypes = docs?.map(doc => ({
      ...doc,
      docType: typeMap.get(doc.document_type_id)
    })) || []

    return NextResponse.json({
      success: true,
      document_types: docTypes,
      sample_documents: docsWithTypes,
    })
  } catch (error: any) {
    console.error('[v0] Error in check-document-types:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
