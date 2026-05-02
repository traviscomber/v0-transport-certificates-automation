import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notifyExecutivas } from '@/lib/notifications-helper'

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

    // Normalize to English lowercase — this is what uploaded_documents.validation_status stores
    const toEnglish: Record<string, string> = {
      'aprobado': 'approved',
      'rechazado': 'rejected',
      'pendiente': 'pending',
      'vencido': 'expired',
      'approved': 'approved',
      'rejected': 'rejected',
      'pending': 'pending',
      'expired': 'expired',
    }

    const dbStatus = toEnglish[rawStatus?.toLowerCase()]
    if (!dbStatus) {
      return NextResponse.json({ error: 'Invalid status: ' + rawStatus }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // STEP 1: Get document details BEFORE update for logging
    const { data: documentBefore } = await adminClient
      .from('uploaded_documents')
      .select('*')
      .eq('id', documentId)
      .single()

    // STEP 2: Update uploaded_documents.validation_status — the table being used in the UI
    console.log('[v0] Updating uploaded_documents - documentId:', documentId, 'dbStatus:', dbStatus)
    
    const { error: updateError, data: updateData } = await adminClient
      .from('uploaded_documents')
      .update({ 
        validation_status: dbStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId)
      .select()
    
    console.log('[v0] Update result - error:', updateError, 'data length:', updateData?.length)

    if (updateError) {
      console.error('[v0] ❌ Failed to update validation_status:', updateError.message)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    console.log('[v0] ✅ UPDATE executed - documentId:', documentId, 'from:', documentBefore?.validation_status, 'to:', dbStatus, 'rows:', updateData?.length)

    // STEP 3: Get conductor name for notification
    let conductorName = 'Unknown'
    if (documentBefore?.conductor_id) {
      const { data: conductor } = await adminClient
        .from('conductores')
        .select('nombres, apellido_paterno, apellido_materno')
        .eq('id', documentBefore.conductor_id)
        .single()
      
      if (conductor) {
        conductorName = [conductor.nombres, conductor.apellido_paterno, conductor.apellido_materno]
          .filter(Boolean)
          .join(' ')
          .trim()
      }
    }

    // STEP 4: Notify ejecutivas about the status change (non-blocking)
    const notificationPayload = {
      type: 'status_change' as const,
      conductorName,
      documentType: documentBefore?.document_type_id || 'Document',
      oldStatus: documentBefore?.validation_status || 'unknown',
      newStatus: dbStatus,
      documentId,
    }

    notifyExecutivas(notificationPayload).then(result => {
      console.log('[v0] Notification result:', result)
    }).catch(err => {
      console.error('[v0] Notification error (non-blocking):', err)
    })

    // Small delay to ensure Supabase broadcast is queued
    await new Promise(resolve => setTimeout(resolve, 100))
    console.log('[v0] ⏳ Broadcast delay completed')

    // STEP 5: Emit event to orchestration system (non-blocking)
    emitToOrchestrator(documentId, dbStatus, reason).catch(err => {
      console.error('[v0] Orchestrator emit failed:', err)
    })

    return NextResponse.json({
      success: true,
      document_id: documentId,
      status: dbStatus,
      previous_status: documentBefore?.validation_status,
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
      .from('uploaded_documents')
      .select('validation_status')
      .eq('id', params.id)
      .single()

    if (error || !data) {
      return NextResponse.json({ document_id: params.id, status: 'pendiente' })
    }

    return NextResponse.json({ document_id: params.id, status: data.validation_status })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
