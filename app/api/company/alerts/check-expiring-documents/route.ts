import { NextResponse } from 'next/server'
import { generateExpirationAlerts } from '@/lib/document-alerts-generator'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Check for expiring documents and generate alerts
 * Can be called by a cron job or manually
 * Protected by Authorization header (API key)
 */
export async function POST(request: Request) {
  try {
    // Verify authorization (simple API key check)
    const authHeader = request.headers.get('authorization')
    const expectedKey = process.env.INTERNAL_API_KEY || 'dev-key'

    if (!authHeader || !authHeader.includes(expectedKey)) {
      console.log('[v0] Unauthorized access to expiration check endpoint')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('[v0] Running expiration alert check...')
    await generateExpirationAlerts()

    return NextResponse.json({
      success: true,
      message: 'Expiration alerts generated successfully',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[v0] Error in expiration check endpoint:', error)
    return NextResponse.json(
      { error: 'Failed to check expiring documents' },
      { status: 500 }
    )
  }
}
