import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const driverId = searchParams.get('driver_id')
    const driverRut = searchParams.get('driver_rut')

    // driver_id IS the conductor_id - use it directly
    if (!driverId || driverId === 'undefined') {
      console.log('[v0] Missing driver_id parameter')
      return NextResponse.json({ error: 'driver_id required' }, { status: 400 })
    }

    console.log('[v0] Fetching documents for conductor_id:', driverId)

    const adminClient = await createAdminClient()

    // Query uploaded_documents with JOIN to document_types
    const { data: documents, error: dbError } = await adminClient
      .from('uploaded_documents')
      .select(`
        id,
        conductor_id,
        original_filename,
        document_type_id,
        file_url,
        validation_status,
        rejection_reason,
        created_at,
        expiration_date,
        document_types (
          id,
          code,
          name
        )
      `)
      .eq('conductor_id', driverId)
      .order('created_at', { ascending: false })

    if (dbError) {
      console.error('[v0] Error querying uploaded_documents:', dbError.message)
      return NextResponse.json({ success: true, documents: [] }, {
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      })
    }

    console.log('[v0] Found', documents?.length || 0, 'documents for conductor_id:', driverId)

    // CRITICAL: Sync document statuses with latest alerts
    // For each document, check if there's a recent alert with a different status
    // If so, use the alert status as the source of truth
    const documentsWithAlertSync = await Promise.all((documents || []).map(async (doc: any) => {
      try {
        // Get the most recent alert for this document
        const { data: alerts, error: alertsError } = await adminClient
          .from('alerts')
          .select('metadata, created_at, type')
          .eq('metadata->>document_id', doc.id)
          .order('created_at', { ascending: false })
          .limit(1)
        
        if (alertsError) {
          console.warn('[v0] ALERT SYNC: Error querying alerts for doc', doc.id, ':', alertsError)
          return doc
        }

        const latestAlert = alerts?.[0]
        if (latestAlert?.metadata?.status) {
          const alertStatus = latestAlert.metadata.status // 'approved', 'pending', 'rejected'
          const dbStatus = (doc.validation_status || 'pending').toLowerCase()
          
          if (alertStatus !== dbStatus) {
            console.log('[v0] ALERT SYNC: Document', doc.id, 'has mismatched status', {
              dbStatus,
              alertStatus,
              alertCreatedAt: latestAlert.created_at,
              alertType: latestAlert.type,
            })
            
            // Update document to match the alert status
            const { error: updateError } = await adminClient
              .from('uploaded_documents')
              .update({ validation_status: alertStatus })
              .eq('id', doc.id)
            
            if (!updateError) {
              // Update the doc object to reflect the change
              doc.validation_status = alertStatus
              console.log('[v0] ALERT SYNC: Updated document', doc.id, 'status to', alertStatus)
            } else {
              console.error('[v0] ALERT SYNC: Failed to update document', doc.id, ':', updateError)
            }
          }
        }
      } catch (alertErr) {
        console.error('[v0] ALERT SYNC: Error checking alerts for doc', doc.id, ':', alertErr)
        // Continue with document as-is if alert check fails
      }
      
      return doc
    }))

    const statusMap: Record<string, string> = {
      'approved': 'aprobado',
      'validated': 'aprobado',
      'rejected': 'rechazado',
      'pending': 'pendiente',
      'expired': 'vencido',
      'aprobado': 'aprobado',
      'rechazado': 'rechazado',
      'pendiente': 'pendiente',
      'vencido': 'vencido',
    }

    const formattedDocs = (documentsWithAlertSync || []).map((doc: any) => {
      const rawStatus = (doc.validation_status || 'pending').toLowerCase()
      const estadoEspanol = statusMap[rawStatus] || 'pendiente'

      console.log('[v0] Formatting doc:', {
        id: doc.id,
        rawValidationStatus: doc.validation_status,
        rawStatusLower: rawStatus,
        estadoEspanol,
        willSendAsVerificationStatus: estadoEspanol,
      })

      return {
        id: doc.id,
        driver_rut: driverRut || '',
        file_name: doc.original_filename,
        original_filename: doc.original_filename,
        upload_date: doc.created_at,
        created_at: doc.created_at,
        document_type: doc.document_types?.name || doc.original_filename || 'Documento',
        document_type_code: doc.document_types?.code,
        verification_status: estadoEspanol,
        validation_status: doc.validation_status,
        rejection_reason: doc.rejection_reason || null,
        expiration_date: doc.expiration_date || null,
        size: 0,
        storage_path: '',
        public_url: doc.file_url || '',
      }
    })

    return NextResponse.json({ success: true, conductor_id: driverId, documents: formattedDocs }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    })

  } catch (error) {
    console.error('[v0] Error in GET /api/company/documents/drivers:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error fetching documents' },
      { status: 500 }
    )
  }
}
