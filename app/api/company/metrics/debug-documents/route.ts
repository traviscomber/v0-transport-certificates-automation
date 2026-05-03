export const dynamic = 'force-dynamic'
export const revalidate = 0

import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const adminClient = createAdminClient()

    // Check documents table
    const { data: documents, error: docsError, count: docsCount } = await adminClient
      .from('documents')
      .select('*', { count: 'exact' })
      .limit(5)

    // Check uploaded_documents table
    const { data: uploadedDocs, error: uploadError, count: uploadCount } = await adminClient
      .from('uploaded_documents')
      .select('*', { count: 'exact' })
      .limit(5)

    console.log('[v0] Documents table count:', docsCount, 'error:', docsError?.message)
    console.log('[v0] Uploaded_documents table count:', uploadCount, 'error:', uploadError?.message)

    return NextResponse.json({
      documents_table: {
        count: docsCount,
        error: docsError?.message,
        samples: documents?.slice(0, 2),
      },
      uploaded_documents_table: {
        count: uploadCount,
        error: uploadError?.message,
        samples: uploadedDocs?.slice(0, 2),
      },
    })
  } catch (error) {
    console.error('[v0] Debug error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error' })
  }
}
