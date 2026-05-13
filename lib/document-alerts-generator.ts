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
 * Generate alerts based on AI analysis results
 * Creates expiration warnings if fecha de vencimiento is detected
 */
export async function generateAIAnalysisAlerts(params: {
  documentId: string
  documentTable: 'subcontractor_documents' | 'uploaded_documents'
  transportistaId?: string
  conductorId?: string
  documentType: string
  aiExpirationDate: string | null
  aiConfidence: number
  fileName: string
}) {
  try {
    const supabase = createAdminClient()
    const { documentId, documentTable, transportistaId, conductorId, documentType, aiExpirationDate, aiConfidence, fileName } = params

    console.log('[v0] generateAIAnalysisAlerts:', params)

    // Lookup ejecutiva
    const ejecutivaNombre = await lookupEjecutiva({
      transportistaId,
      conductorId,
    })

    // If expiration date was detected, check if document is expired or expiring soon
    if (aiExpirationDate) {
      const today = new Date()
      const expirationDate = new Date(aiExpirationDate)
      const daysUntilExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      const expDateStr = expirationDate.toLocaleDateString('es-CL')

      let alertType = 'info'
      let priority = 'low'
      let title = ''
      let message = ''
      let shouldCreateAlert = false

      if (daysUntilExpiration < 0) {
        // Document is already expired
        alertType = 'error'
        priority = 'critical'
        title = `DOCUMENTO VENCIDO - ${documentType}`
        message = `El documento "${fileName}" (${documentType}) VENCIO el ${expDateStr} (hace ${Math.abs(daysUntilExpiration)} dias). Requiere renovacion inmediata.`
        shouldCreateAlert = true
      } else if (daysUntilExpiration <= 7) {
        // Expires within 7 days - critical
        alertType = 'error'
        priority = 'high'
        title = `URGENTE: Documento por Vencer - ${documentType}`
        message = `El documento "${fileName}" (${documentType}) vence en ${daysUntilExpiration} dias (${expDateStr}). Accion inmediata requerida.`
        shouldCreateAlert = true
      } else if (daysUntilExpiration <= 30) {
        // Expires within 30 days - warning
        alertType = 'warning'
        priority = 'medium'
        title = `Documento por Vencer - ${documentType}`
        message = `El documento "${fileName}" (${documentType}) vence el ${expDateStr} (en ${daysUntilExpiration} dias). Considere renovarlo pronto.`
        shouldCreateAlert = true
      } else if (daysUntilExpiration <= 60) {
        // Expires within 60 days - info
        alertType = 'info'
        priority = 'low'
        title = `Aviso: Vencimiento Proximo - ${documentType}`
        message = `El documento "${fileName}" (${documentType}) vence el ${expDateStr} (en ${daysUntilExpiration} dias).`
        shouldCreateAlert = true
      }

      if (shouldCreateAlert) {
        // Check if similar alert already exists to avoid duplicates
        const { data: existingAlert } = await supabase
          .from('alerts_log')
          .select('id')
          .eq('document_id', documentId)
          .eq('alert_type', alertType)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
          .maybeSingle()

        if (!existingAlert) {
          const { error: insertError } = await supabase
            .from('alerts_log')
            .insert({
              alert_type: alertType,
              title,
              description: message,
              message,
              priority,
              entity_type: 'document',
              entity_id: documentId,
              entity_name: fileName,
              is_read: false,
              is_resolved: false,
              status: 'pendiente',
              ejecutiva_nombre: ejecutivaNombre,
              transportista_id: transportistaId || null,
              driver_id: conductorId || null,
              document_id: documentId,
              document_type: documentType,
              action_url: `/dashboard/company/documentos/pendientes`,
              metadata: {
                document_id: documentId,
                document_table: documentTable,
                ai_expiration_date: aiExpirationDate,
                ai_confidence: aiConfidence,
                days_until_expiration: daysUntilExpiration,
                file_name: fileName,
                source: 'ai_analysis',
              },
            })

          if (insertError) {
            console.error('[v0] Error creating AI analysis alert:', insertError)
          } else {
            console.log(`[v0] Created AI expiration alert: ${title} (${daysUntilExpiration} days, ejecutiva: ${ejecutivaNombre})`)
          }
        } else {
          console.log('[v0] Similar alert already exists, skipping')
        }
      }

      // Update the document with the AI-detected expiration date in expires_at column
      const { error: updateError } = await supabase
        .from(documentTable)
        .update({ 
          expires_at: aiExpirationDate,
        })
        .eq('id', documentId)

      if (updateError) {
        console.error('[v0] Error updating expires_at:', updateError)
      } else {
        console.log('[v0] Updated document expires_at to:', aiExpirationDate)
      }
    }

    // Also create a general "analysis complete" info alert
    const { error: analysisAlertError } = await supabase
      .from('alerts_log')
      .insert({
        alert_type: 'success',
        title: `Analisis IA Completado - ${documentType}`,
        description: `El documento "${fileName}" fue analizado con ${Math.round(aiConfidence * 100)}% de confianza. ${aiExpirationDate ? `Fecha de vencimiento detectada: ${new Date(aiExpirationDate).toLocaleDateString('es-CL')}` : 'No se detecto fecha de vencimiento.'}`,
        message: `Analisis IA completado para ${fileName}`,
        priority: 'low',
        entity_type: 'document',
        entity_id: documentId,
        entity_name: fileName,
        is_read: false,
        is_resolved: true,
        status: 'completado',
        ejecutiva_nombre: ejecutivaNombre,
        transportista_id: transportistaId || null,
        driver_id: conductorId || null,
        document_id: documentId,
        document_type: documentType,
        action_url: `/dashboard/company/documentos/pendientes`,
        metadata: {
          document_id: documentId,
          document_table: documentTable,
          ai_confidence: aiConfidence,
          ai_expiration_date: aiExpirationDate,
          source: 'ai_analysis',
        },
      })

    if (analysisAlertError) {
      console.error('[v0] Error creating analysis complete alert:', analysisAlertError)
    }

  } catch (error) {
    console.error('[v0] Error in generateAIAnalysisAlerts:', error)
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
