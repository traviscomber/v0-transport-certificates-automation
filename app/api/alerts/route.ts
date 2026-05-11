import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

// Production schema: alerts_log table with ejecutiva_nombre, status, action_type fields

export async function GET(request: Request) {
  try {
    const supabase = createAdminClient()

    const url = new URL(request.url)
    const type = url.searchParams.get('type')
    const priority = url.searchParams.get('priority')
    const is_read = url.searchParams.get('is_read')
    const ejecutiva = url.searchParams.get('ejecutiva')
    const status = url.searchParams.get('status')
    const limit = parseInt(url.searchParams.get('limit') || '100')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    console.log('[v0] Fetching alerts with limit:', limit)

    // First, get alerts from the alerts table
    let alertsQuery = supabase
      .from('alerts')
      .select('*', { count: 'exact' })

    // Filter by ejecutiva - use the ejecutiva_nombre column directly
    if (ejecutiva) alertsQuery = alertsQuery.eq('ejecutiva_nombre', ejecutiva)
    
    if (type) alertsQuery = alertsQuery.eq('alert_type', type)
    if (priority) alertsQuery = alertsQuery.eq('priority', priority)
    if (status) alertsQuery = alertsQuery.eq('status', status)
    if (is_read !== null && is_read !== '') alertsQuery = alertsQuery.eq('is_read', is_read === 'true')

    const { data: rawAlerts, error, count } = await alertsQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('[ALERTS API] GET error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Normalize alerts from alerts table
    const alerts = (rawAlerts || []).map((a: any) => ({
      id: a.id,
      type: a.alert_type || 'info',
      title: a.title,
      message: a.message || a.description || '',
      description: a.description || a.message || '',
      priority: a.priority || 'medium',
      category: a.entity_type || 'general',
      is_read: a.is_read ?? false,
      is_dismissed: a.is_resolved ?? false,
      action_url: a.action_url,
      ejecutiva_asignada: a.ejecutiva_nombre,
      status: a.status || 'pendiente',
      action_type: a.action_type,
      action_notes: a.action_notes,
      actioned_by: a.actioned_by,
      actioned_at: a.actioned_at,
      transportista_id: a.transportista_id,
      subcontratista_id: a.subcontratista_id,
      driver_id: a.driver_id,
      document_id: a.document_id,
      document_type: a.document_type,
      entity_name: a.entity_name,
      metadata: a.metadata || {},
      created_at: a.created_at,
      source: 'alerts_table'
    }))

    // Also get recent document upload events for dynamic alerts
    console.log('[v0] Fetching recent document uploads for alerts')
    const { data: uploadedDocs, error: uploadError } = await supabase
      .from('uploaded_documents')
      .select(`
        id,
        conductor_id,
        document_type_id,
        original_filename,
        validation_status,
        created_at,
        document_types (name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (!uploadError && uploadedDocs) {
      // Convert document uploads to alert format
      for (const doc of uploadedDocs) {
        const { data: conductor } = await supabase
          .from('conductores')
          .select('rut, nombres, apellido_paterno')
          .eq('id', doc.conductor_id)
          .single()

        const docTypeName = (doc.document_types as any)?.name || 'Documento Desconocido'
        
        // Determine alert type and title based on validation status
        let alertType = 'DOCUMENT_PENDING'
        let title = `Documento Subido - ${docTypeName}`
        let priorityLevel = 'medium'
        
        if (doc.validation_status === 'approved') {
          alertType = 'DOCUMENT_APPROVED'
          title = `Documento Aprobado - ${docTypeName}`
          priorityLevel = 'low'
        } else if (doc.validation_status === 'rejected') {
          alertType = 'DOCUMENT_REJECTED'
          title = `Documento Rechazado - ${docTypeName}`
          priorityLevel = 'high'
        }

        const conductorName = conductor 
          ? `${conductor.nombres} ${conductor.apellido_paterno} (${conductor.rut})`
          : 'Conductor Desconocido'

        alerts.push({
          id: `upload_${doc.id}`,
          type: alertType,
          title: title,
          message: `El ${docTypeName.toLowerCase()} de ${conductorName} fue ${
            doc.validation_status === 'approved' ? 'aprobado' :
            doc.validation_status === 'rejected' ? 'rechazado' :
            'subido'
          }. [ALERT-${doc.id.substring(0, 8).toUpperCase()}]`,
          priority: priorityLevel,
          is_read: false,
          is_dismissed: false,
          created_at: doc.created_at,
          metadata: {
            document_id: doc.id,
            conductor_id: doc.conductor_id,
            document_type: docTypeName,
            validation_status: doc.validation_status
          },
          source: 'document_upload'
        })
      }
    }

    // Sort all alerts by created_at descending and apply limit
    const sortedAlerts = alerts.sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }).slice(0, limit)

    console.log('[v0] Total alerts generated:', sortedAlerts.length)

    return NextResponse.json({
      alerts: sortedAlerts,
      total: sortedAlerts.length,
      limit,
      offset,
      ejecutiva: ejecutiva || null,
    })
  } catch (error: any) {
    console.error('[ALERTS API] GET unexpected error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()
    const { ids, is_read, is_dismissed } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "ids es requerido" }, { status: 400 })
    }

    const updateData: any = {}
    if (is_read !== undefined) updateData.is_read = is_read
    if (is_dismissed !== undefined) updateData.is_resolved = is_dismissed

    const { data: updated, error } = await supabase
      .from('alerts')
      .update(updateData)
      .in('id', ids)
      .select()

    if (error) throw error

    return NextResponse.json({ data: updated, message: `${updated?.length || 0} alertas actualizadas` })
  } catch (error: any) {
    console.error('[ALERTS API] PATCH error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
