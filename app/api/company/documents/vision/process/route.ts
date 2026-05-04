import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Batch vision processing started')

    const supabase = await createClient()

    // Get all documents pending vision processing
    const { data: pendingDocs, error } = await supabase
      .from('uploaded_documents')
      .select('id')
      .eq('vision_status', 'pending')
      .order('created_at', { ascending: true })
      .limit(10) // Process 10 at a time

    if (error) {
      console.error('[v0] Error fetching pending documents:', error)
      throw error
    }

    console.log('[v0] Found', pendingDocs?.length || 0, 'documents pending vision processing')

    // Process each document
    const results = []
    for (const doc of pendingDocs || []) {
      try {
        console.log('[v0] Processing document:', doc.id)
        const response = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/company/documents/${doc.id}/vision`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        const result = await response.json()
        results.push({
          documentId: doc.id,
          success: response.ok,
          message: result.error || 'Processed successfully',
        })
      } catch (err) {
        console.error('[v0] Error processing document', doc.id, ':', err)
        results.push({
          documentId: doc.id,
          success: false,
          message: err instanceof Error ? err.message : 'Unknown error',
        })
      }
    }

    console.log('[v0] Batch processing completed:', results)

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    })
  } catch (error) {
    console.error('[v0] Batch processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process batch', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
