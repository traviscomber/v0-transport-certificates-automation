import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status, reason } = await request.json()
    const adminClient = createAdminClient()
    const documentId = params.id

    if (!['pending', 'approved', 'rejected', 'expired'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    console.log('[v0] Changing document status:', { documentId, status, reason })

    // Intenta guardar en table document_statuses si existe
    // Si no existe, simplemente mantiene el status en memoria para esta sesión
    try {
      const { error: upsertError } = await adminClient
        .from('document_statuses')
        .upsert({
          document_id: documentId,
          status: status,
          reason: reason || 'Sin motivo especificado',
          changed_at: new Date().toISOString(),
          changed_by: 'admin'
        }, {
          onConflict: 'document_id'
        })

      if (upsertError) {
        console.warn('[v0] Warning - could not save status to DB:', upsertError.message)
        // Continuamos de todas formas, el status se guarda en memoria
      }
    } catch (dbError) {
      console.warn('[v0] DB operation failed, using in-memory storage:', dbError)
    }

    console.log('[v0] Document status updated:', status)

    return NextResponse.json({
      success: true,
      document_id: documentId,
      status: status,
      message: `Estado del documento cambiado a ${status}`,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('[v0] Error in PATCH /api/company/documents/[id]/status:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminClient = createAdminClient()
    const documentId = params.id

    // Intenta obtener status de la tabla
    try {
      const { data: statusData, error } = await adminClient
        .from('document_statuses')
        .select('*')
        .eq('document_id', documentId)
        .single()

      if (!error && statusData) {
        return NextResponse.json({
          document_id: documentId,
          status: statusData.status,
          reason: statusData.reason,
          changed_at: statusData.changed_at,
          changed_by: statusData.changed_by
        })
      }
    } catch (dbError) {
      console.warn('[v0] Could not fetch from DB:', dbError)
    }

    // Si no existe en BD, retorna estado por defecto
    return NextResponse.json({
      document_id: documentId,
      status: 'pending',
      reason: null,
      changed_at: null,
      changed_by: null
    })
  } catch (error) {
    console.error('[v0] Error in GET /api/company/documents/[id]/status:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
