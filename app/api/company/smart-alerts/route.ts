import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface SmartAlert {
  id: string
  type: 'expiring_soon' | 'expired' | 'pending_review' | 'rejected'
  priority: 'critical' | 'high' | 'medium' | 'low'
  title: string
  message: string
  daysUntilExpiry?: number
  documentId: string
  conductorName: string
  documentType: string
  transportistaName: string
  ejecutiva: string
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const today = new Date()
    const warningDaysThreshold = 30 // Alert if expiring within 30 days
    
    const smartAlerts: SmartAlert[] = []

    // 1. Get documents expiring soon (within 30 days)
    const { data: expiringDocs } = await supabase
      .from('uploaded_documents')
      .select(`
        id,
        expiration_date,
        extracted_document_type,
        conductor_id,
        transportista_id,
        validation_status,
        conductores (
          id,
          nombre,
          apellidos
        ),
        transportistas (
          nombre_fantasia,
          razon_social,
          ejecutivo_nombre
        )
      `)
      .eq('validation_status', 'approved')
      .gte('expiration_date', today.toISOString().split('T')[0])
      .lte('expiration_date', new Date(today.getTime() + warningDaysThreshold * 24 * 60 * 60 * 1000).toISOString().split('T')[0])

    if (expiringDocs) {
      for (const doc of expiringDocs) {
        const conductor = doc.conductores as any
        const transportista = doc.transportistas as any
        const expiryDate = new Date(doc.expiration_date)
        const daysUntil = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        
        const conductorName = `${conductor?.nombre || ''} ${conductor?.apellidos || ''}`.trim() || 'Conductor Desconocido'
        const transportistaName = transportista?.nombre_fantasia || transportista?.razon_social || 'Transportista Desconocido'
        const documentType = doc.extracted_document_type || 'Documento'

        let priority: 'critical' | 'high' | 'medium' = 'medium'
        if (daysUntil <= 7) priority = 'critical'
        else if (daysUntil <= 15) priority = 'high'

        smartAlerts.push({
          id: `expiring_${doc.id}`,
          type: 'expiring_soon',
          priority,
          title: `${documentType} Próximo a Vencer`,
          message: `${documentType} de ${conductorName} vence en ${daysUntil} días (${doc.expiration_date})`,
          daysUntilExpiry: daysUntil,
          documentId: doc.id,
          conductorName,
          documentType,
          transportistaName,
          ejecutiva: transportista?.ejecutivo_nombre || 'Sin asignar',
        })
      }
    }

    // 2. Get expired documents
    const { data: expiredDocs } = await supabase
      .from('uploaded_documents')
      .select(`
        id,
        expiration_date,
        extracted_document_type,
        conductor_id,
        transportista_id,
        conductores (
          id,
          nombre,
          apellidos
        ),
        transportistas (
          nombre_fantasia,
          razon_social,
          ejecutivo_nombre
        )
      `)
      .eq('validation_status', 'approved')
      .lt('expiration_date', today.toISOString().split('T')[0])

    if (expiredDocs) {
      for (const doc of expiredDocs) {
        const conductor = doc.conductores as any
        const transportista = doc.transportistas as any
        
        const conductorName = `${conductor?.nombre || ''} ${conductor?.apellidos || ''}`.trim() || 'Conductor Desconocido'
        const transportistaName = transportista?.nombre_fantasia || transportista?.razon_social || 'Transportista Desconocido'
        const documentType = doc.extracted_document_type || 'Documento'

        smartAlerts.push({
          id: `expired_${doc.id}`,
          type: 'expired',
          priority: 'critical',
          title: `${documentType} Vencido`,
          message: `${documentType} de ${conductorName} venció el ${doc.expiration_date}. Renovación urgente requerida.`,
          documentId: doc.id,
          conductorName,
          documentType,
          transportistaName,
          ejecutiva: transportista?.ejecutivo_nombre || 'Sin asignar',
        })
      }
    }

    // 3. Get documents pending review
    const { data: pendingDocs } = await supabase
      .from('uploaded_documents')
      .select(`
        id,
        extracted_document_type,
        conductor_id,
        transportista_id,
        created_at,
        conductores (
          id,
          nombre,
          apellidos
        ),
        transportistas (
          nombre_fantasia,
          razon_social,
          ejecutivo_nombre
        )
      `)
      .eq('validation_status', 'pending')
      .order('created_at', { ascending: true })
      .limit(5)

    if (pendingDocs) {
      for (const doc of pendingDocs) {
        const conductor = doc.conductores as any
        const transportista = doc.transportistas as any
        
        const conductorName = `${conductor?.nombre || ''} ${conductor?.apellidos || ''}`.trim() || 'Conductor Desconocido'
        const transportistaName = transportista?.nombre_fantasia || transportista?.razon_social || 'Transportista Desconocido'
        const documentType = doc.extracted_document_type || 'Documento'

        smartAlerts.push({
          id: `pending_${doc.id}`,
          type: 'pending_review',
          priority: 'medium',
          title: `${documentType} Pendiente de Revisión`,
          message: `${documentType} de ${conductorName} requiere revisión por ${transportista?.ejecutivo_nombre || 'un ejecutivo'}.`,
          documentId: doc.id,
          conductorName,
          documentType,
          transportistaName,
          ejecutiva: transportista?.ejecutivo_nombre || 'Sin asignar',
        })
      }
    }

    // 4. Get recently rejected documents
    const { data: rejectedDocs } = await supabase
      .from('uploaded_documents')
      .select(`
        id,
        extracted_document_type,
        conductor_id,
        transportista_id,
        validation_notes,
        updated_at,
        conductores (
          id,
          nombre,
          apellidos
        ),
        transportistas (
          nombre_fantasia,
          razon_social,
          ejecutivo_nombre
        )
      `)
      .eq('validation_status', 'rejected')
      .order('updated_at', { ascending: false })
      .limit(5)

    if (rejectedDocs) {
      for (const doc of rejectedDocs) {
        const conductor = doc.conductores as any
        const transportista = doc.transportistas as any
        
        const conductorName = `${conductor?.nombre || ''} ${conductor?.apellidos || ''}`.trim() || 'Conductor Desconocido'
        const transportistaName = transportista?.nombre_fantasia || transportista?.razon_social || 'Transportista Desconocido'
        const documentType = doc.extracted_document_type || 'Documento'

        smartAlerts.push({
          id: `rejected_${doc.id}`,
          type: 'rejected',
          priority: 'high',
          title: `${documentType} Rechazado`,
          message: `${documentType} de ${conductorName} fue rechazado. Motivo: ${doc.validation_notes || 'No especificado'}`,
          documentId: doc.id,
          conductorName,
          documentType,
          transportistaName,
          ejecutiva: transportista?.ejecutivo_nombre || 'Sin asignar',
        })
      }
    }

    // Sort by priority and return
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    smartAlerts.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

    return NextResponse.json(smartAlerts.slice(0, 10))
  } catch (error) {
    console.error('[v0] Error generating smart alerts:', error)
    return NextResponse.json(
      { error: 'Error generating smart alerts' },
      { status: 500 }
    )
  }
}
