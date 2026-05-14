import { NextRequest, NextResponse } from 'next/server'

/**
 * Proxy endpoint for serving PDF and document files from Supabase Storage
 * This helps with CORS issues and allows controlled access
 */
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const url = searchParams.get('url')

    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      )
    }

    // Validate that URL is from our Supabase bucket
    if (!url.includes('supabase.co') || !url.includes('subcontractor-documents')) {
      return NextResponse.json(
        { error: 'Invalid URL - must be from Supabase storage' },
        { status: 403 }
      )
    }

    // Fetch the file from Supabase
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/pdf, image/*',
      }
    })

    if (!response.ok) {
      console.error('[v0] Failed to fetch document:', response.status, response.statusText)
      return NextResponse.json(
        { error: `Failed to fetch document: ${response.statusText}` },
        { status: response.status }
      )
    }

    const buffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'application/octet-stream'

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
      }
    })
  } catch (error) {
    console.error('[v0] Proxy error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to proxy document' },
      { status: 500 }
    )
  }
}
