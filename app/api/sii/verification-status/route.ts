import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { transportistaId, transportistaRut } = body

    if (!transportistaId || !transportistaRut) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create Supabase client with service role key (server-side)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    )

    // Query for recent verification results
    const { data: existingRuns, error: queryError } = await supabase
      .from('external_verification_runs')
      .select('id, status, normalized_result, created_at, expires_at')
      .eq('source_code', 'sii_tax_status')
      .eq('entity_type', 'transportista')
      .eq('entity_id', transportistaId)
      .or(`expires_at.is.null,expires_at.gte.${new Date().toISOString()}`)
      .order('created_at', { ascending: false })
      .limit(1)

    if (queryError) {
      console.error('[v0] Error querying verification runs:', queryError)
      return NextResponse.json(
        {
          documentId: transportistaId,
          status: 'pending',
          rut: transportistaRut,
        },
        { status: 200 }
      )
    }

    // If we have a valid cached result, return it
    if (existingRuns && existingRuns.length > 0) {
      const run = existingRuns[0]
      const status = run.status === 'success' ? 'verified' : run.status === 'failed' ? 'failed' : 'pending'

      return NextResponse.json({
        documentId: transportistaId,
        status,
        rut: transportistaRut,
        verifiedAt: run.created_at,
        errorCode: (run.normalized_result as any)?.errorCode,
        confidence: (run.normalized_result as any)?.confidence,
      })
    }

    // No cached result - return pending status
    return NextResponse.json({
      documentId: transportistaId,
      status: 'pending',
      rut: transportistaRut,
    })

  } catch (error) {
    console.error('[v0] SII verification status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
