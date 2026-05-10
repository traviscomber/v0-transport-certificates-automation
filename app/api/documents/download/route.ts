import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/documents/download
 * Download a document file
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filePath = searchParams.get('path')

    if (!filePath) {
      return NextResponse.json(
        { error: 'File path is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Get signed download URL
    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(filePath, 3600) // 1 hour expiry

    if (error || !data) {
      return NextResponse.json(
        { error: 'Failed to generate download link' },
        { status: 500 }
      )
    }

    // Redirect to signed URL
    return NextResponse.redirect(data.signedUrl)
  } catch (error) {
    console.error('[v0] Error downloading document:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to download document' },
      { status: 500 }
    )
  }
}
