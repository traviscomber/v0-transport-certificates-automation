import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
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

    // Get all document types to find F23 and F29 IDs
    const { data: docTypes, error: typesError } = await supabase
      .from('subcontractor_document_types')
      .select('id, code, nombre')

    if (typesError) {
      return NextResponse.json({ error: typesError.message }, { status: 500 })
    }

    // Find F29 ID (the new/current one)
    const f29Type = docTypes?.find(dt => dt.code === 'F29' || dt.nombre?.includes('F29'))
    
    if (!f29Type) {
      return NextResponse.json(
        { error: 'F29 document type not found' },
        { status: 404 }
      )
    }

    console.log('[v0] Found F29 type:', f29Type)

    // Find all old F23 IDs that might exist
    const f23Types = docTypes?.filter(dt => dt.code === 'F23' || dt.nombre?.includes('F23')) || []
    
    if (f23Types.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No F23 types found to update',
        f29_type: f29Type,
      })
    }

    console.log('[v0] Found F23 types to update:', f23Types)

    // Update all references - in subcontractor_documents table
    const updateResults = []
    for (const f23Type of f23Types) {
      // Update subcontractor_documents
      const { data: subUpdated, error: subError } = await supabase
        .from('subcontractor_documents')
        .update({ document_type_id: f29Type.id })
        .eq('document_type_id', f23Type.id)

      if (subError) {
        console.error('[v0] Error updating subcontractor_documents:', subError)
      } else {
        updateResults.push({
          table: 'subcontractor_documents',
          from_type_id: f23Type.id,
          from_type_code: f23Type.code,
          to_type_id: f29Type.id,
          to_type_code: f29Type.code,
          success: true,
        })
      }

      // Update conductor_documents
      const { data: condUpdated, error: condError } = await supabase
        .from('conductor_documents')
        .update({ document_type_id: f29Type.id })
        .eq('document_type_id', f23Type.id)

      if (condError) {
        console.error('[v0] Error updating conductor_documents:', condError)
      } else {
        updateResults.push({
          table: 'conductor_documents',
          from_type_id: f23Type.id,
          from_type_code: f23Type.code,
          to_type_id: f29Type.id,
          to_type_code: f29Type.code,
          success: true,
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'All F23 document references updated to F29',
      f29_type: f29Type,
      updates: updateResults,
    })
  } catch (error: any) {
    console.error('[v0] Error in update-document-types-references:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
