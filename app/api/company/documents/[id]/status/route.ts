import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Emit event to orchestration system
async function emitToOrchestrator(documentId: string, status: string, reason?: string) {
  try {
    console.log('[v0] 📡 Emitting event to orchestrator:', { documentId, status, reason })
    
    // Emit event to orchestration system
    const orchestratorEvent = {
      type: 'document_status_changed',
      module: 'documents',
      entity_id: documentId,
      payload: {
        document_id: documentId,
        new_status: status,
        reason: reason || '',
        timestamp: new Date().toISOString(),
      }
    }
    
    // You can add your orchestration event emitter here
    // For now, we'll just log it for real-time systems to pick up
    console.log('[v0] ✅ Orchestrator event:', orchestratorEvent)
    
    // Optionally emit to other systems (alerts, notifications, etc.)
    if (typeof window === 'undefined') {
      // Server-side: could emit to queues, webhooks, etc.
      // Example: await emitToAlertSystem(orchestratorEvent)
    }
    
    return true
  } catch (error) {
    console.error('[v0] ⚠️ Failed to emit to orchestrator:', error)
    // Don't fail the request if orchestrator fails
    return false
  }
}

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

    // STEP 1: Get document details BEFORE update for logging
    const { data: documentBefore } = await adminClient
      .from('driver_documents')
      .select('*')
      .eq('id', documentId)
      .single()

    // STEP 2: Update driver_documents.status — single source of truth for UI
    console.log('[v0] Executing UPDATE query for document:', documentId, 'to status:', spanishStatus)
    
    const { error: updateError, data: updateData } = await adminClient
      .from('driver_documents')
      .update({ 
        status: spanishStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId)
      .select()

    if (updateError) {
      console.error('[v0] ❌ Failed to update driver_documents.status:', updateError.message)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    console.log('[v0] ✅ UPDATE executed successfully:', { 
      documentId, 
      from: documentBefore?.status, 
      to: spanishStatus,
      rowsUpdated: updateData?.length || 0,
      responseData: updateData
    })

    // Small delay to ensure Supabase broadcast is queued
    await new Promise(resolve => setTimeout(resolve, 100))
    console.log('[v0] ⏳ Broadcast delay completed')

    // STEP 3: Emit event to orchestration system (non-blocking)
    emitToOrchestrator(documentId, spanishStatus, reason).catch(err => {
      console.error('[v0] Orchestrator emit failed:', err)
    })

    // STEP 4: Broadcast change via Supabase Realtime (automatically handled by Supabase)
    // The database update triggers realtime events that clients listening to the table will receive

    return NextResponse.json({
      success: true,
      document_id: documentId,
      status: spanishStatus,
      previous_status: documentBefore?.status,
      message: 'Document status updated and broadcast to clients',
      realtime_enabled: true,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[v0] ❌ PATCH /status error:', msg)
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
