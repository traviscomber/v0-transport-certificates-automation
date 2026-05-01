import { NextResponse, NextRequest } from 'next/server'
import { generateExpirationAlerts } from '@/lib/document-alerts-generator'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Check for expiring documents and generate alerts
 * Called by Vercel Crons daily at 6 AM UTC
 * Also can be called manually with Authorization header for testing
 */
export async function POST(request: NextRequest) {
  try {
    // Check if this is from Vercel Crons (authorization.token header) or manual call
    const authHeader = request.headers.get('authorization')
    const cronSecret = request.headers.get('authorization')?.split(' ')[1]
    const expectedKey = process.env.INTERNAL_API_KEY || 'dev-key'
    
    // For Vercel Crons, check x-vercel-cron header instead
    const isVercelCron = request.headers.get('user-agent')?.includes('cron') || 
                         request.nextUrl.searchParams.get('cron') === 'true'
    
    // Allow if: it's from Vercel Cron, or if Authorization header matches
    const isAuthorized = isVercelCron || (authHeader && authHeader.includes(expectedKey))

    if (!isAuthorized && authHeader) {
      console.log('[v0] Unauthorized access to expiration check endpoint')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('[v0] Running expiration alert check...', { isVercelCron, timestamp: new Date().toISOString() })
    await generateExpirationAlerts()

    return NextResponse.json({
      success: true,
      message: 'Expiration alerts generated successfully',
      timestamp: new Date().toISOString(),
      source: isVercelCron ? 'vercel-cron' : 'manual',
    })
  } catch (error) {
    console.error('[v0] Error in expiration check endpoint:', error)
    return NextResponse.json(
      { error: 'Failed to check expiring documents', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint for testing/manual triggers
 */
export async function GET(request: NextRequest) {
  try {
    // GET is always allowed for testing in development
    if (process.env.NODE_ENV === 'production') {
      const authHeader = request.headers.get('authorization')
      const expectedKey = process.env.INTERNAL_API_KEY || 'dev-key'
      
      if (!authHeader || !authHeader.includes(expectedKey)) {
        return NextResponse.json(
          { error: 'Unauthorized in production' },
          { status: 401 }
        )
      }
    }

    console.log('[v0] Running manual expiration alert check via GET...')
    await generateExpirationAlerts()

    return NextResponse.json({
      success: true,
      message: 'Expiration alerts generated successfully (manual trigger)',
      timestamp: new Date().toISOString(),
      source: 'manual-get',
    })
  } catch (error) {
    console.error('[v0] Error in expiration check GET endpoint:', error)
    return NextResponse.json(
      { error: 'Failed to check expiring documents', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
