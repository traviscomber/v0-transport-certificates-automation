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
  const { data, error } = await supabase.rpc('run_compliance_intelligence_sync')

  if (error) {
    return NextResponse.json(
      {
        error: error.message,
        durationMs: Date.now() - startedAt,
      },
      { status: 500 },
    )
  }

  return NextResponse.json({
    ok: true,
    result: data,
    durationMs: Date.now() - startedAt,
  })
}
