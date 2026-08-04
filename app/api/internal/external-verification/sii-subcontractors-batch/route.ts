import { createHash, timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { runExternalVerification } from '@/lib/external-verification/engine'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 300

const NONCE_SHA256 = '1c02db13271518ee5a29e8d791c80ba24a8955961796c58260a82ac916afc10e'
const EXPIRES_AT = Date.parse('2026-08-04T06:30:00.000Z')
const MAX_BATCH_SIZE = 10

function safeEqualHex(left: string, right: string): boolean {
  if (!/^[a-f0-9]{64}$/i.test(left) || !/^[a-f0-9]{64}$/i.test(right)) return false
  const a = Buffer.from(left, 'hex')
  const b = Buffer.from(right, 'hex')
  return a.length === b.length && timingSafeEqual(a, b)
}

function isAuthorized(request: NextRequest): boolean {
  if (Date.now() > EXPIRES_AT) return false
  const nonce = request.nextUrl.searchParams.get('nonce')
  if (!nonce) return false
  return safeEqualHex(createHash('sha256').update(nonce).digest('hex'), NONCE_SHA256)
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const requestedOffset = Number(request.nextUrl.searchParams.get('offset') ?? '0')
  const requestedLimit = Number(request.nextUrl.searchParams.get('limit') ?? String(MAX_BATCH_SIZE))
  const offset = Number.isInteger(requestedOffset) && requestedOffset >= 0 ? requestedOffset : 0
  const limit = Number.isInteger(requestedLimit)
    ? Math.min(Math.max(requestedLimit, 1), MAX_BATCH_SIZE)
    : MAX_BATCH_SIZE

  const supabase = createAdminClient()
  const { data: subcontractors, error, count } = await supabase
    .from('subcontratistas')
    .select('id, rut, razon_social, is_active', { count: 'exact' })
    .not('rut', 'is', null)
    .order('id', { ascending: true })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const results = []
  for (const subcontractor of subcontractors ?? []) {
    try {
      const verification = await runExternalVerification({
        sourceCode: 'sii_tax_status',
        entityType: 'subcontratista',
        entityId: subcontractor.id,
        payload: { rut: subcontractor.rut, adapterVersion: 3 },
      })

      results.push({
        id: subcontractor.id,
        rut: subcontractor.rut,
        storedName: subcontractor.razon_social,
        active: subcontractor.is_active,
        runId: verification.runId,
        cacheHit: verification.cacheHit,
        status: verification.result.status,
        normalizedResult: verification.result.normalizedResult ?? null,
        errorCode: verification.result.errorCode ?? null,
        errorMessage: verification.result.errorMessage ?? null,
      })
    } catch (verificationError) {
      results.push({
        id: subcontractor.id,
        rut: subcontractor.rut,
        storedName: subcontractor.razon_social,
        active: subcontractor.is_active,
        status: 'failed',
        errorCode: 'BATCH_ITEM_FAILURE',
        errorMessage: verificationError instanceof Error ? verificationError.message : 'Unknown error',
      })
    }
  }

  const nextOffset = offset + results.length
  return NextResponse.json({
    total: count ?? 0,
    offset,
    limit,
    processed: results.length,
    nextOffset: nextOffset < (count ?? 0) ? nextOffset : null,
    results,
  })
}
