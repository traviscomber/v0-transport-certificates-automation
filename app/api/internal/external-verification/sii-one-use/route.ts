import { createHash, timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { runExternalVerification } from '@/lib/external-verification/engine'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const NONCE_SHA256 = 'f2265f03a8d0956f0ac99a9a6c696d0164780fcae0c8271dae8e01ed492f6158'
const EXPIRES_AT = 1785815077
const TRANSPORTISTA_ID = '3c15f69c-862f-433c-9d34-0ee57c1a3d47'
const TRANSPORTISTA_RUT = '77965304-8'

function safeEqualHex(left: string, right: string): boolean {
  if (!/^[a-f0-9]{64}$/i.test(left) || !/^[a-f0-9]{64}$/i.test(right)) return false
  const a = Buffer.from(left, 'hex')
  const b = Buffer.from(right, 'hex')
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function GET(request: NextRequest) {
  if (Math.floor(Date.now() / 1000) > EXPIRES_AT) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const nonce = request.nextUrl.searchParams.get('nonce')
  if (!nonce || !safeEqualHex(createHash('sha256').update(nonce).digest('hex'), NONCE_SHA256)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    const result = await runExternalVerification({
      sourceCode: 'sii_tax_status',
      entityType: 'transportista',
      entityId: TRANSPORTISTA_ID,
      payload: { rut: TRANSPORTISTA_RUT, testMode: true, adapterVersion: 3 },
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
