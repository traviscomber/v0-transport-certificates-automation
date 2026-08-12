import { NextRequest, NextResponse } from 'next/server'
import { checkGTrackHealth } from '@/lib/integrations/gtrack-client'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  return !secret || request.headers.get('authorization') === `Bearer ${secret}`
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await checkGTrackHealth()
  const httpStatus = result.classification === 'ok'
    ? 200
    : result.classification === 'not_configured'
      ? 503
      : 502

  return NextResponse.json({
    service: 'gtrack',
    ...result,
  }, {
    status: httpStatus,
    headers: { 'cache-control': 'no-store' },
  })
}
