import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 120

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  return !secret || request.headers.get('authorization') === `Bearer ${secret}`
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startedAt = Date.now()
  const supabase = createAdminClient()

  const { data: documentFacts, error: documentFactsError } = await supabase.rpc(
    'sync_subcontractor_document_facts',
  )

  if (documentFactsError) {
    return NextResponse.json(
      {
        stage: 'document_facts',
        error: documentFactsError.message,
        durationMs: Date.now() - startedAt,
      },
      { status: 500 },
    )
  }

  const { data: intelligence, error: intelligenceError } = await supabase.rpc(
    'run_compliance_intelligence_sync',
  )

  if (intelligenceError) {
    return NextResponse.json(
      {
        stage: 'compliance_intelligence',
        documentFacts,
        error: intelligenceError.message,
        durationMs: Date.now() - startedAt,
      },
      { status: 500 },
    )
  }

  return NextResponse.json({
    ok: true,
    documentFacts,
    intelligence,
    durationMs: Date.now() - startedAt,
  })
}
