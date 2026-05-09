import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/documents/preview
 * Get a preview/view link for a document
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

    // Get signed public URL for preview
    const { data } = await supabase.storage
      .from('documents')
      .getPublicUrl(filePath)

    if (!data) {
      return NextResponse.json(
        { error: 'Failed to generate preview link' },
        { status: 500 }
      )
    }

    // Redirect to public URL
    return NextResponse.redirect(data.publicUrl)
  } catch (error) {
    console.error('[v0] Error previewing document:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to preview document' },
      { status: 500 }
    )
  }
}
