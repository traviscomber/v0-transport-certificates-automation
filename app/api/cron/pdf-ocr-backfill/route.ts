import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 300
export const runtime = 'nodejs'

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  return !secret || request.headers.get('authorization') === `Bearer ${secret}`
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  const { error: recoveryError } = await supabase.rpc('recover_stale_pdf_ocr_processing', {
    p_stale_minutes: 20,
  })
  if (recoveryError) {
    return NextResponse.json({ stage: 'stale_recovery', error: recoveryError.message }, { status: 500 })
  }

  const { data: claimed, error: claimError } = await supabase.rpc('claim_pdf_ocr_documents', {
    p_limit: 1,
  })
  if (claimError) {
    return NextResponse.json({ stage: 'claim', error: claimError.message }, { status: 500 })
  }

  const documentId = claimed?.[0]?.document_id
  if (!documentId) {
    return NextResponse.json({ status: 'idle', reason: 'No eligible PDF documents found' })
  }

  const target = new URL('/api/pdf-ocr', request.nextUrl.origin)
  target.searchParams.set('documentId', documentId)

  const headers: Record<string, string> = {}
  const secret = process.env.CRON_SECRET
  if (secret) headers.authorization = `Bearer ${secret}`

  const response = await fetch(target, {
    method: 'GET',
    headers,
    cache: 'no-store',
  })
  const body = await response.text()

  return new NextResponse(body, {
    status: response.status,
    headers: {
      'content-type': response.headers.get('content-type') ?? 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  })
}
