import { createHash, timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { runExternalVerification } from '@/lib/external-verification/engine'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 300

const NONCE_SHA256 = '8f2d1b822e1fdbc4186e09f3e3f37ea20822ea90e2bd543323bb09daef140508'
const EXPIRES_AT = Date.parse('2026-08-04T08:00:00.000Z')
const MAX_BATCH_SIZE = 250

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
  if (!isAuthorized(request)) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const rawOffset = Number(request.nextUrl.searchParams.get('offset') ?? '0')
  const rawLimit = Number(request.nextUrl.searchParams.get('limit') ?? String(MAX_BATCH_SIZE))
  const offset = Number.isInteger(rawOffset) && rawOffset >= 0 ? rawOffset : 0
  const limit = Number.isInteger(rawLimit) ? Math.min(Math.max(rawLimit, 1), MAX_BATCH_SIZE) : MAX_BATCH_SIZE

  const supabase = createAdminClient()
  const { data: transportistas, error, count } = await supabase
    .from('transportistas')
    .select('id, rut, razon_social, is_active', { count: 'exact' })
    .not('rut', 'is', null)
    .order('id', { ascending: true })
    .range(offset, offset + limit - 1)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const results = []
  for (const transportista of transportistas ?? []) {
    try {
      const verification = await runExternalVerification({
        sourceCode: 'sii_tax_status',
        entityType: 'transportista',
        entityId: transportista.id,
        payload: { rut: transportista.rut, adapterVersion: 3 },
      })
      results.push({
        id: transportista.id,
        rut: transportista.rut,
        storedName: transportista.razon_social,
        active: transportista.is_active,
        runId: verification.runId,
        cacheHit: verification.cacheHit,
        status: verification.result.status,
        normalizedResult: verification.result.normalizedResult ?? null,
        errorCode: verification.result.errorCode ?? null,
        errorMessage: verification.result.errorMessage ?? null,
      })
    } catch (error) {
      results.push({
        id: transportista.id,
        rut: transportista.rut,
        storedName: transportista.razon_social,
        active: transportista.is_active,
        status: 'failed',
        errorCode: 'BATCH_ITEM_FAILURE',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
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
