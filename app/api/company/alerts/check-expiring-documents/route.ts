import { NextResponse, NextRequest } from 'next/server'
import { generateExpirationAlerts } from '@/lib/document-alerts-generator'
import { isAuthorizedExpirationCronRequest } from '@/lib/expiration-cron-auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function isVercelCron(request: NextRequest): boolean {
  return request.headers.get('user-agent') === 'vercel-cron/1.0'
}

async function runExpirationAlertCheck(request: NextRequest, source: string) {
  if (!isAuthorizedExpirationCronRequest(request.headers)) {
    console.log('[v0] Unauthorized access to expiration check endpoint')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const cronRequest = isVercelCron(request)
    console.log('[v0] Running expiration alert check...', {
      isVercelCron: cronRequest,
      timestamp: new Date().toISOString(),
    })

    await generateExpirationAlerts()

    return NextResponse.json({
      success: true,
      message: 'Expiration alerts generated successfully',
      timestamp: new Date().toISOString(),
      source: cronRequest ? 'vercel-cron' : source,
    })
  } catch (error) {
    console.error('[v0] Error in expiration check endpoint:', error)
    return NextResponse.json(
      {
        error: 'Failed to check expiring documents',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  return runExpirationAlertCheck(request, 'manual-post')
}

export async function GET(request: NextRequest) {
  return runExpirationAlertCheck(request, 'manual-get')
}
