import { NextRequest, NextResponse } from 'next/server'
import { runExternalVerification } from '@/lib/external-verification/engine'

export const dynamic = 'force-dynamic'

/**
 * Trigger SII verification for a transportista.
 * Calls the engine directly (no internal HTTP loop) so verification
 * completes synchronously and persists results before responding.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { transportistaId, transportistaRut } = body

    if (!transportistaId || !transportistaRut) {
      return NextResponse.json(
        { error: 'Missing transportistaId or transportistaRut' },
        { status: 400 },
      )
    }

    if (process.env.EXTERNAL_VERIFICATION_LAB_ENABLED !== 'true') {
      return NextResponse.json({ triggered: false, reason: 'lab_disabled' }, { status: 200 })
    }

    if (process.env.SII_TAX_STATUS_CANARY_ENABLED !== 'true') {
      return NextResponse.json({ triggered: false, reason: 'canary_disabled' }, { status: 200 })
    }

    const { runId, result } = await runExternalVerification({
      sourceCode: 'sii_tax_status',
      entityType: 'transportista',
      entityId: transportistaId,
      payload: { rut: transportistaRut },
    })

    return NextResponse.json({
      triggered: true,
      runId,
      runStatus: result.status,
      errorCode: result.errorCode ?? null,
    })
  } catch (error) {
    // Don't surface errors to client — badge will stay pending
    console.error('[SII trigger]', error instanceof Error ? error.message : error)
    return NextResponse.json({ triggered: false, reason: 'engine_error' }, { status: 200 })
  }
}
