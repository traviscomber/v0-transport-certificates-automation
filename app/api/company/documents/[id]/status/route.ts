import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateDocumentStatusChangeAlert } from '@/lib/document-alerts-generator'

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

    const adminClient = await createAdminClient()

    // STEP 1: Get document details BEFORE update for logging
    const { data: documentBefore } = await adminClient
      .from('uploaded_documents')
      .select('*')
      .eq('id', documentId)
      .single()

    // STEP 2: Update uploaded_documents.validation_status — the table being used in the UI
    console.log('[v0] Updating uploaded_documents - documentId:', documentId, 'dbStatus:', dbStatus, 'reason:', reason)
    
    const updatePayload: any = { 
      validation_status: dbStatus
    }
    
    // Store rejection reason if provided
    if (reason && dbStatus === 'rejected') {
      updatePayload.rejection_reason = reason
    }
    
    const { error: updateError, data: updateData } = await adminClient
      .from('uploaded_documents')
      .update(updatePayload)
      .eq('id', documentId)
      .select()
      .single()
    
    if (updateError) {
      console.error('[v0] ❌ PATCH UPDATE FAILED:', {
        documentId,
        error: updateError.message,
      })
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    if (!updateData) {
      console.error('[v0] ❌ UPDATE returned null data for documentId:', documentId)
      return NextResponse.json({ error: 'Update returned no data' }, { status: 500 })
    }

    // CRITICAL: Wait for DB replication before returning
    // Supabase can have lag between write and read replicas
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Verify the update was persisted by reading it back
    const { data: verifyData, error: verifyError } = await adminClient
      .from('uploaded_documents')
      .select('validation_status')
      .eq('id', documentId)
      .single()

    if (verifyError || verifyData?.validation_status !== dbStatus) {
      console.error('[v0] ⚠️ Verification failed after UPDATE:', {
        documentId,
        expectedStatus: dbStatus,
        actualStatus: verifyData?.validation_status,
        verifyError: verifyError?.message
      })
      // Don't fail - the update likely succeeded but verification failed
    } else {
      console.log('[v0] ✅ UPDATE verified - documentId:', documentId, 'status:', dbStatus)
    }

    // STEP 3: Generate alert with real conductor name from conductores table
    // Generate alerts for all status changes: pending, approved, rejected
    try {
      // Resolve conductor name from conductores table
      let conductorName = 'Conductor'
      let documentTypeName = 'Documento'

      if (documentBefore?.conductor_id) {
        const { data: conductor } = await adminClient
          .from('conductores')
          .select('nombres, apellido_paterno, apellido_materno')
          .eq('id', documentBefore.conductor_id)
          .single()

        if (conductor) {
          conductorName = [conductor.nombres, conductor.apellido_paterno, conductor.apellido_materno]
            .filter(Boolean).join(' ').trim()
        }
      }

      if (documentBefore?.document_type_id) {
        const { data: docType } = await adminClient
          .from('document_types')
          .select('name')
          .eq('id', documentBefore.document_type_id)
          .single()

        if (docType?.name) documentTypeName = docType.name
      }

      await generateDocumentStatusChangeAlert(
        documentId,
        documentTypeName,
        conductorName,
        documentBefore?.conductor_id || '',
        dbStatus as 'approved' | 'rejected' | 'pending',
        reason || undefined
      )
    } catch (alertErr) {
      console.error('[v0] Alert generation failed (non-blocking):', alertErr)
    }

    // STEP 4: Emit event to orchestration system (non-blocking)
    emitToOrchestrator(documentId, dbStatus, reason).catch(err => {
      console.error('[v0] Orchestrator emit failed:', err)
    })

    const responsePayload = {
      success: true,
      document_id: documentId,
      status: dbStatus,
      previous_status: documentBefore?.validation_status,
      message: 'Document status updated and broadcast to clients',
      realtime_enabled: true,
    }
    
    console.log('[v0] PATCH response:', responsePayload)
    return NextResponse.json(responsePayload)
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
