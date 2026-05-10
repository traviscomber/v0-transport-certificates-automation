import { createAdminClient } from '@/lib/supabase/admin'

// Production-ready alert generation system using alerts_log table
// Auto-assigns alerts to the correct ejecutiva based on transportista/subcontratista relationships
// Alerts are fetched via /api/alerts and filtered by ejecutiva_nombre

/**
 * Lookup ejecutiva from various entity IDs
 */
async function lookupEjecutiva(params: {
  transportistaId?: string
  subcontratistaId?: string
  driverId?: string
  conductorId?: string
}): Promise<string | null> {
  try {
    const supabase = createAdminClient()

    // Lookup by transportista_id
    if (params.transportistaId) {
      const { data } = await supabase
        .from('transportistas')
        .select('ejecutivo_nombre, ejecutiva')
        .eq('id', params.transportistaId)
        .maybeSingle()
      if (data) {
        return data.ejecutivo_nombre || data.ejecutiva || null
      }
    }

    // Lookup by subcontratista_id
    if (params.subcontratistaId) {
      const { data } = await supabase
        .from('subcontractors')
        .select('ejecutiva')
        .eq('id', params.subcontratistaId)
        .maybeSingle()
      if (data) {
        return data.ejecutiva || null
      }
    }

    // Lookup by driver_id or conductor_id - find associated transportista
    const driverId = params.driverId || params.conductorId
    if (driverId) {
      // Try drivers table first
      let transportistaId: string | null = null
      const { data: driver } = await supabase
        .from('drivers')
        .select('transportista_id')
        .eq('id', driverId)
        .maybeSingle()
      
      transportistaId = driver?.transportista_id || null

      // Try conductores table if not found
      if (!transportistaId) {
        const { data: conductor } = await supabase
          .from('conductores')
          .select('transportista_id')
          .eq('id', driverId)
          .maybeSingle()
        transportistaId = conductor?.transportista_id || null
      }

      if (transportistaId) {
        return await lookupEjecutiva({ transportistaId })
      }
    }

    return null
  } catch (error) {
    console.error('[v0] Error looking up ejecutiva:', error)
    return null
  }
}

/**
 * Generate alerts when a document is uploaded by conductor or client
 * Uses alerts_log table with ejecutiva auto-assignment
 */
export async function generateDocumentUploadAlerts(
  uploadedDocumentId: string,
  documentType: string,
  uploaderName: string,
  uploaderType: 'conductor' | 'client',
  uploaderId: string
) {
  try {
    const supabase = createAdminClient()

    console.log('[v0] generateDocumentUploadAlerts:', { uploadedDocumentId, documentType, uploaderName, uploaderType, uploaderId })

    // Lookup ejecutiva based on uploader type
    const ejecutivaNombre = await lookupEjecutiva({
      conductorId: uploaderType === 'conductor' ? uploaderId : undefined,
    })

    const message = `${uploaderName} ha subido ${documentType}. Accion requerida: revisar y validar.`

    const { error: insertError } = await supabase
      .from('alerts_log')
      .insert({
        alert_type: 'info',
        title: `Nuevo Documento - ${uploaderName}`,
        description: message,
        message: message,
        priority: 'medium',
        entity_type: 'document',
        entity_id: uploadedDocumentId,
        entity_name: uploaderName,
        is_read: false,
        is_resolved: false,
        status: 'pendiente',
        ejecutiva_nombre: ejecutivaNombre,
        driver_id: uploaderType === 'conductor' ? uploaderId : null,
        document_id: uploadedDocumentId,
        document_type: documentType,
        action_url: `/dashboard/company/documentos`,
        metadata: {
          document_id: uploadedDocumentId,
          uploader_type: uploaderType,
          uploader_name: uploaderName,
          document_type: documentType,
        },
      })

    if (insertError) {
      console.error('[v0] Error inserting document upload alert:', insertError)
    } else {
      console.log(`[v0] Created document upload alert for ejecutiva: ${ejecutivaNombre}`)
    }
  } catch (error) {
    console.error('[v0] Error in generateDocumentUploadAlerts:', error)
  }
}

/**
 * Generate alerts when document status changes (approved/rejected/pending)
 */
export async function generateDocumentStatusChangeAlert(
  uploadedDocumentId: string,
  documentType: string,
  conductorName: string,
  conductorId: string,
  newStatus: 'approved' | 'rejected' | 'pending',
  reason?: string
) {
  try {
    const supabase = createAdminClient()

    console.log('[v0] generateDocumentStatusChangeAlert:', { uploadedDocumentId, documentType, conductorName, newStatus })

    // Generate unique correlation code (format: ALERT-YYYYMMDD-XXXXXX)
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    const correlationCode = `ALERT-${dateStr}-${randomCode}`

    // Fetch conductor's transportista to find ejecutiva
    let transportistaName = 'Transportista Desconocido'
    let transportistaId: string | null = null
    let ejecutivaAsignada: string | null = null
    
    const { data: conductor } = await supabase
      .from('conductores')
      .select('id, transportista_id')
      .eq('id', conductorId)
      .maybeSingle()

    if (conductor?.transportista_id) {
      transportistaId = conductor.transportista_id
      const { data: transportista } = await supabase
        .from('transportistas')
        .select('razon_social, nombre_fantasia, ejecutivo_nombre, ejecutiva')
        .eq('id', conductor.transportista_id)
        .maybeSingle()
      
      if (transportista) {
        transportistaName = transportista.nombre_fantasia || transportista.razon_social || 'Transportista Desconocido'
        ejecutivaAsignada = transportista.ejecutivo_nombre || transportista.ejecutiva || null
      }
    }

    // Build message and severity based on status
    let title = ''
    let message = ''
    let alertType: string = 'info'
    let priority = 'medium'

    if (newStatus === 'approved') {
      title = `Documento Aprobado - ${documentType}`
      message = `El documento ${documentType} de ${conductorName} (${transportistaName}) fue aprobado. [${correlationCode}]`
      alertType = 'success'
      priority = 'low'
    } else if (newStatus === 'rejected') {
      title = `Documento Rechazado - ${documentType}`
      message = `El documento ${documentType} de ${conductorName} (${transportistaName}) fue rechazado. Razon: ${reason || 'Sin especificar'}. [${correlationCode}]`
      alertType = 'error'
      priority = 'high'
    } else if (newStatus === 'pending') {
      title = `Documento en Revision - ${documentType}`
      message = `El documento ${documentType} de ${conductorName} (${transportistaName}) ha sido retornado a revision. [${correlationCode}]`
      alertType = 'warning'
      priority = 'medium'
    }

    const { error: alertError } = await supabase
      .from('alerts_log')
      .insert({
        alert_type: alertType,
        title,
        description: message,
        message,
        priority,
        entity_type: 'document',
        entity_id: uploadedDocumentId,
        entity_name: conductorName,
        is_read: false,
        is_resolved: newStatus !== 'pending',
        status: newStatus === 'pending' ? 'pendiente' : 'resuelto',
        ejecutiva_nombre: ejecutivaAsignada,
        transportista_id: transportistaId,
        driver_id: conductorId,
        document_id: uploadedDocumentId,
        document_type: documentType,
        action_url: `/dashboard/company/documentos`,
        metadata: {
          document_id: uploadedDocumentId,
          conductor_id: conductorId,
          conductor_name: conductorName,
          document_type: documentType,
          transportista_name: transportistaName,
          ejecutiva_asignada: ejecutivaAsignada,
          reason: reason || null,
          status: newStatus,
          correlation_code: correlationCode,
        },
      })

    if (alertError) {
      console.error('[v0] Error creating status change alert:', alertError)
    } else {
      console.log(`[v0] Created status change alert for ejecutiva: ${ejecutivaAsignada}, code: ${correlationCode}`)
    }
  } catch (error) {
    console.error('[v0] Error in generateDocumentStatusChangeAlert:', error)
  }
}

/**
 * Generate expiration alerts for documents close to expiration date
 */
export async function generateExpirationAlerts() {
  try {
    const supabase = createAdminClient()
    const today = new Date()
    const in7days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

    // Find documents expiring in the next 7 days
    const { data: expiringDocs } = await supabase
      .from('uploaded_documents')
      .select('id, conductor_id, document_type_id, expiration_date, document_types(name)')
      .lt('expiration_date', in7days.toISOString())
      .gt('expiration_date', today.toISOString())
      .is('last_expiration_alert_sent', null)

    if (!expiringDocs || expiringDocs.length === 0) {
      console.log('[v0] No expiring documents found')
      return
    }

    // Build alerts with ejecutiva lookup
    const alertsToCreate = await Promise.all(
      expiringDocs.map(async (doc: any) => {
        const ejecutivaNombre = await lookupEjecutiva({
          conductorId: doc.conductor_id,
        })

        const docName = doc.document_types?.name || 'Documento'
        const expDate = new Date(doc.expiration_date).toLocaleDateString('es-CL')
        const message = `El documento ${docName} vence el ${expDate}`

        return {
          alert_type: 'warning',
          title: `Documento por Vencer - ${docName}`,
          description: message,
          message,
          priority: 'high',
          entity_type: 'document',
          entity_id: doc.id,
          is_read: false,
          is_resolved: false,
          status: 'pendiente',
          ejecutiva_nombre: ejecutivaNombre,
          driver_id: doc.conductor_id,
          document_id: doc.id,
          document_type: docName,
          action_url: `/dashboard/company/documentos`,
          metadata: {
            document_id: doc.id,
            conductor_id: doc.conductor_id,
            expiration_date: doc.expiration_date,
          },
        }
      })
    )

    if (alertsToCreate.length > 0) {
      const { error: insertError } = await supabase
        .from('alerts_log')
        .insert(alertsToCreate)

      if (!insertError) {
        // Update last alert sent timestamp
        await supabase
          .from('uploaded_documents')
          .update({ last_expiration_alert_sent: new Date().toISOString() })
          .in('id', expiringDocs.map((d: any) => d.id))

        console.log(`[v0] Created ${alertsToCreate.length} expiration alerts`)
      } else {
        console.error('[v0] Error inserting expiration alerts:', insertError)
      }
    }
  } catch (error) {
    console.error('[v0] Error in generateExpirationAlerts:', error)
  }
}
