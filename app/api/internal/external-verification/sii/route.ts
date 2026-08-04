import { createHmac, timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { runExternalVerification } from '@/lib/external-verification/engine'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SIGNED_REQUEST_TTL_SECONDS = 120

function safeHexEqual(left: string, right: string): boolean {
  if (!/^[a-f0-9]{64}$/i.test(left) || !/^[a-f0-9]{64}$/i.test(right)) return false
  const leftBuffer = Buffer.from(left, 'hex')
  const rightBuffer = Buffer.from(right, 'hex')
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer)
}

function isSignedRequestAuthorized(request: NextRequest, expected: string): boolean {
  const run = request.nextUrl.searchParams.get('run')
  const timestamp = request.nextUrl.searchParams.get('ts')
  const signature = request.nextUrl.searchParams.get('sig')
  const rut = request.nextUrl.searchParams.get('rut') ?? ''
  const transportistaId = request.nextUrl.searchParams.get('transportistaId') ?? ''

  if (run !== '1' || !timestamp || !signature || !rut) return false

  const timestampSeconds = Number(timestamp)
  if (!Number.isFinite(timestampSeconds)) return false
  const ageSeconds = Math.abs(Math.floor(Date.now() / 1000) - timestampSeconds)
  if (ageSeconds > SIGNED_REQUEST_TTL_SECONDS) return false

  const canonical = `${timestamp}:${rut}:${transportistaId}`
  const expectedSignature = createHmac('sha256', expected).update(canonical).digest('hex')
  return safeHexEqual(signature, expectedSignature)
}

function isAuthorized(request: NextRequest) {
  const expected = process.env.EXTERNAL_VERIFICATION_LAB_TOKEN
  if (!expected) return false

  const authorization = request.headers.get('authorization')
  const internalToken = request.headers.get('x-labbe-lab-token')
  return (
    authorization === `Bearer ${expected}` ||
    internalToken === expected ||
    isSignedRequestAuthorized(request, expected)
  )
}

async function executeCanary(rut: string, transportistaId?: string) {
  return runExternalVerification(
    {
      sourceCode: 'sii_tax_status',
      entityType: 'transportista',
      entityId: transportistaId,
      payload: {
        rut,
        testMode: true,
      },
    },
    undefined,
  )
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

  const body = payload as { rut?: unknown; transportistaId?: unknown }
  if (typeof body.rut !== 'string' || body.rut.trim().length === 0) {
    return NextResponse.json({ error: 'rut is required' }, { status: 400 })
  }

  if (body.transportistaId !== undefined && typeof body.transportistaId !== 'string') {
    return NextResponse.json({ error: 'transportistaId must be a string' }, { status: 400 })
  }

  try {
    const result = await executeCanary(
      body.rut,
      typeof body.transportistaId === 'string' ? body.transportistaId : undefined,
    )

    return NextResponse.json({
      success: true,
      mode: 'silent_canary',
      disclaimer: 'La información SII es parcial y no constituye certificación tributaria.',
      ...result,
    })
  } catch (error) {
    return verificationErrorResponse(error)
  }
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (request.nextUrl.searchParams.get('run') === '1') {
    const rut = request.nextUrl.searchParams.get('rut')
    const transportistaId = request.nextUrl.searchParams.get('transportistaId') ?? undefined
    if (!rut) return NextResponse.json({ error: 'rut is required' }, { status: 400 })

    try {
      const result = await executeCanary(rut, transportistaId)
      return NextResponse.json({
        success: true,
        mode: 'signed_single_canary',
        disclaimer: 'La información SII es parcial y no constituye certificación tributaria.',
        ...result,
      })
    } catch (error) {
      return verificationErrorResponse(error)
    }
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

function verificationErrorResponse(error: unknown) {
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
