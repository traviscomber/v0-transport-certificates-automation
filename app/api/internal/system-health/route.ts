import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  return !secret || request.headers.get('authorization') === `Bearer ${secret}`
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const [{ data: health, error: healthError }, { data: ocrQueue, error: queueError }] = await Promise.all([
    supabase.from('compliance_system_health').select('*').single(),
    supabase.from('ocr_priority_queue').select('*').limit(25),
  ])

  if (healthError || queueError) {
    return NextResponse.json(
      {
        error: healthError?.message ?? queueError?.message ?? 'System health query failed',
      },
      { status: 500 },
    )
  }

  return NextResponse.json({
    ok: true,
    health,
    ocrQueue,
  })
}
