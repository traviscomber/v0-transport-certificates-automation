import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 300

const DOCUMENT_ID = '2be79d8a-c71d-4cdf-b02e-29e2a7fe3790'

export async function GET(request: Request) {
  const origin = new URL(request.url).origin
  const response = await fetch(`${origin}/api/company/documents/${DOCUMENT_ID}/reprocess`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentId: DOCUMENT_ID }),
    cache: 'no-store',
  })

  const payload = await response.json().catch(() => ({}))
  return NextResponse.json(
    { documentId: DOCUMENT_ID, upstreamStatus: response.status, payload },
    { status: response.ok ? 200 : 502 },
  )
}
