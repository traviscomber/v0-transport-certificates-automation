import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireServerActor } from '@/lib/auth/server-actor'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const auth = await requireServerActor(['admin'])
  if (!auth.actor) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const supabase = createAdminClient()

    const { data: docTypes } = await supabase
      .from('subcontractor_document_types')
      .select('id, code, nombre')

    const { data: docs } = await supabase
      .from('subcontractor_documents')
      .select('id, file_name, document_type_id, status')
      .limit(10)

    const typeMap = new Map(docTypes?.map((dt) => [dt.id, dt]) || [])
    const docsWithTypes = docs?.map((doc) => ({
      ...doc,
      docType: typeMap.get(doc.document_type_id),
    })) || []

    return NextResponse.json({
      success: true,
      document_types: docTypes,
      sample_documents: docsWithTypes,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
