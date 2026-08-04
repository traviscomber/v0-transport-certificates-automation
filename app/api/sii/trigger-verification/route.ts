import { NextRequest, NextResponse } from 'next/server'

/**
 * Trigger SII verification for a transportista
 * This endpoint should be called from the client when a subcontractor detail modal opens
 * and the SII verification status is "pending"
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { transportistaId, transportistaRut } = body

    if (!transportistaId || !transportistaRut) {
      return NextResponse.json(
        { error: 'Missing transportistaId or transportistaRut' },
        { status: 400 }
      )
    }

    // Check if SII canary is enabled
    if (process.env.SII_TAX_STATUS_CANARY_ENABLED !== 'true') {
      console.log('[v0] SII verification disabled')
      return NextResponse.json({ triggered: false }, { status: 200 })
    }

    // Get the lab token
    const labToken = process.env.EXTERNAL_VERIFICATION_LAB_TOKEN

    // Call the internal SII verification endpoint
    try {
      // Get the app URL from headers or use localhost
      const protocol = request.headers.get('x-forwarded-proto') || 'http'
      const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000'
      const appUrl = `${protocol}://${host}`

      const response = await fetch(`${appUrl}/api/internal/external-verification/sii`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${labToken}`,
          'X-Labbe-Lab-Token': labToken || '',
        },
        body: JSON.stringify({
          rut: transportistaRut,
          transportistaId,
        }),
      })

      if (!response.ok) {
        console.warn('[v0] SII verification endpoint returned:', response.status)
        // Still return success - verification will be retried
      }

      return NextResponse.json({ triggered: true }, { status: 200 })
    } catch (error) {
      console.error('[v0] Error calling SII verification endpoint:', error)
      // Return success anyway - don't block the user
      return NextResponse.json({ triggered: false, error: 'Endpoint call failed' }, { status: 200 })
    }
  } catch (error) {
    console.error('[v0] Error in SII trigger endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
