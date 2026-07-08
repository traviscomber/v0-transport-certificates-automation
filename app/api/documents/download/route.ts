import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { resolveDocumentStorageTarget } from '@/lib/document-file-access'

export const dynamic = 'force-dynamic'

/**
 * GET /api/documents/download
 * Download a document file
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const fileSource = searchParams.get('url') || searchParams.get('path')

    if (!fileSource) {
      return NextResponse.json(
        { error: 'File path is required' },
        { status: 400 }
      )
    }

    const target = resolveDocumentStorageTarget(fileSource)

    const filename = (() => {
      if (target.kind === 'external') {
        try {
          return decodeURIComponent(new URL(target.url).pathname.split('/').filter(Boolean).pop() || 'documento')
        } catch {
          return 'documento'
        }
      }

      return decodeURIComponent(target.path.split('/').filter(Boolean).pop() || 'documento')
    })()

    const sourceResponse = target.kind === 'external'
      ? await fetch(target.url)
      : await (async () => {
          const supabase = createAdminClient()

          // Get signed download URL
          const { data, error } = await supabase.storage
            .from(target.bucket)
            .createSignedUrl(target.path, 3600) // 1 hour expiry

          if (error || !data) {
            return null
          }

          return fetch(data.signedUrl)
        })()

    if (!sourceResponse || !sourceResponse.ok || !sourceResponse.body) {
      return NextResponse.json(
        { error: 'Failed to fetch file for download' },
        { status: 500 }
      )
    }

    const contentType = sourceResponse.headers.get('content-type') || 'application/octet-stream'

    return new NextResponse(sourceResponse.body, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('[v0] Error downloading document:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to download document' },
      { status: 500 }
    )
  }
}
