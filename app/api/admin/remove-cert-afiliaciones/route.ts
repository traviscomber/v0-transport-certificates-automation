import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Delete associated documents first
    const afiliacionesId = 'bc03adce-7b9f-4477-8f83-bb47f71ca2c0'
    
    const { data: docsToDelete, error: findErr } = await supabase
      .from('subcontractor_documents')
      .select('id')
      .eq('document_type_id', afiliacionesId)

    if (docsToDelete && docsToDelete.length > 0) {
      const docIds = docsToDelete.map(d => d.id)
      const { error: deleteDocsErr } = await supabase
        .from('subcontractor_documents')
        .delete()
        .in('id', docIds)
      
      if (deleteDocsErr) {
        console.error('Error deleting associated documents:', deleteDocsErr)
      } else {
        console.log(`Deleted ${docsToDelete.length} associated documents`)
      }
    }

    // Now delete the document type
    const { error: deleteErr } = await supabase
      .from('subcontractor_document_types')
      .delete()
      .eq('id', afiliacionesId)

    if (deleteErr) {
      console.error('Error deleting CERT_AFILIACIONES:', deleteErr)
      return NextResponse.json({ error: deleteErr.message }, { status: 500 })
    }

    // Verify deletion
    const { data: remaining } = await supabase
      .from('subcontractor_document_types')
      .select('*')
      .order('nombre')

    return NextResponse.json({
      success: true,
      message: 'CERT_AFILIACIONES removed successfully along with associated documents',
      total_documents: remaining?.length || 0,
      remaining_documents: remaining
    }, { status: 200 })

  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
