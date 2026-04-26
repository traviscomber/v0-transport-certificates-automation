import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status: rawStatus, reason } = await request.json()
    const documentId = params.id

    if (!rawStatus) {
      return NextResponse.json({ error: 'Missing status' }, { status: 400 })
    }

    // Normalize to Spanish — this is what driver_documents.status stores
    const toSpanish: Record<string, string> = {
      'aprobado': 'aprobado',
      'rechazado': 'rechazado',
      'pendiente': 'pendiente',
      'vencido': 'vencido',
      'approved': 'aprobado',
      'rejected': 'rechazado',
      'pending': 'pendiente',
      'expired': 'vencido',
    }

    const spanishStatus = toSpanish[rawStatus?.toLowerCase()]
    if (!spanishStatus) {
      return NextResponse.json({ error: 'Invalid status: ' + rawStatus }, { status: 400 })
    }

    const adminClient = await createAdminClient()

    // Update driver_documents.status — single source of truth for UI
    const { error: updateError } = await adminClient
      .from('driver_documents')
      .update({ status: spanishStatus })
      .eq('id', documentId)

    if (updateError) {
      console.error('[v0] Failed to update driver_documents.status:', updateError.message)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      document_id: documentId,
      status: spanishStatus,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[v0] PATCH /status error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminClient = await createAdminClient()

    const { data, error } = await adminClient
      .from('driver_documents')
      .select('status')
      .eq('id', params.id)
      .single()

    if (error || !data) {
      return NextResponse.json({ document_id: params.id, status: 'pendiente' })
    }

    return NextResponse.json({ document_id: params.id, status: data.status })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
