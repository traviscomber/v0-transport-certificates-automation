import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { runExternalVerification } from '@/lib/external-verification/engine'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 60

const ENTITY_ID = '0486968b-e191-4709-ad4f-207b56b04809'
const RUT = '77225235-8'

export async function GET() {
  const supabase = createAdminClient()
  const { data: existing } = await supabase
    .from('external_verification_runs')
    .select('id,status,normalized_result,created_at')
    .eq('source_code', 'sii_tax_status')
    .eq('entity_type', 'transportista')
    .eq('entity_id', ENTITY_ID)
    .eq('input_payload->>adapterVersion', '4')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ alreadyExecuted: true, run: existing }, { status: 410 })
  }

  const verification = await runExternalVerification({
    sourceCode: 'sii_tax_status',
    entityType: 'transportista',
    entityId: ENTITY_ID,
    payload: { rut: RUT, adapterVersion: 4 },
  })

  return NextResponse.json({
    alreadyExecuted: false,
    runId: verification.runId,
    cacheHit: verification.cacheHit,
    result: verification.result,
  })
}
