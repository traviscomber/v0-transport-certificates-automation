import { NextRequest, NextResponse } from 'next/server'
import { runExternalVerification } from '@/lib/external-verification/engine'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function isAuthorized(request: NextRequest) {
  const expected = process.env.EXTERNAL_VERIFICATION_LAB_TOKEN
  if (!expected) return false

  const authorization = request.headers.get('authorization')
  const internalToken = request.headers.get('x-labbe-lab-token')
  return authorization === `Bearer ${expected}` || internalToken === expected
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const body = payload as { rut?: unknown; transportistaId?: unknown; bypassCache?: unknown }
  if (typeof body.rut !== 'string' || body.rut.trim().length === 0) {
    return NextResponse.json({ error: 'rut is required' }, { status: 400 })
  }

  if (body.transportistaId !== undefined && typeof body.transportistaId !== 'string') {
    return NextResponse.json({ error: 'transportistaId must be a string' }, { status: 400 })
  }

  try {
    const result = await runExternalVerification(
      {
        sourceCode: 'sii_tax_status',
        entityType: 'transportista',
        entityId: typeof body.transportistaId === 'string' ? body.transportistaId : undefined,
        payload: {
          rut: body.rut,
          testMode: true,
        },
      },
      'internal-sii-canary',
    )

    return NextResponse.json({
      success: true,
      mode: 'silent_canary',
      disclaimer: 'La información SII es parcial y no constituye certificación tributaria.',
      ...result,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown verification error'
    const disabled = /disabled/i.test(message)
    const circuitOpen = /circuit is open/i.test(message)

    return NextResponse.json(
      {
        success: false,
        error: disabled ? 'LAB_DISABLED' : circuitOpen ? 'SOURCE_CIRCUIT_OPEN' : 'SII_CANARY_FAILED',
        message,
      },
      { status: disabled ? 503 : circuitOpen ? 429 : 502 },
    )
  }
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({
    source: 'sii_tax_status',
    labEnabled: process.env.EXTERNAL_VERIFICATION_LAB_ENABLED === 'true',
    canaryEnabled: process.env.SII_TAX_STATUS_CANARY_ENABLED === 'true',
    tokenConfigured: Boolean(process.env.EXTERNAL_VERIFICATION_LAB_TOKEN),
    queryUrlConfigured: Boolean(process.env.SII_TAX_STATUS_QUERY_URL),
    mode: 'silent_canary',
  })
}
