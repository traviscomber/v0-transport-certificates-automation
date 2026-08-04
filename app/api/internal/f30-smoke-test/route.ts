import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 300

const SAMPLE_DOCUMENT_ID = 'fd71e44c-02d4-4da6-91e2-1969d77bcaec'

export async function GET(request: Request) {
  const origin = new URL(request.url).origin
  const response = await fetch(`${origin}/api/company/documents/${SAMPLE_DOCUMENT_ID}/reprocess`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentId: SAMPLE_DOCUMENT_ID }),
    cache: 'no-store',
  })

  const payload = await response.json().catch(() => ({}))
  return NextResponse.json(
    { sampleDocumentId: SAMPLE_DOCUMENT_ID, upstreamStatus: response.status, payload },
    { status: response.ok ? 200 : 502 },
  )
}
