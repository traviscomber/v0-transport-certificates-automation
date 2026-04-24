'use server'

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { allDriversData } from '@/lib/data/all-drivers'
import { allSubcontractorsData } from '@/lib/data/all-subcontractors'

interface GeneratedAlert {
  id: string
  type: 'warning' | 'error' | 'success' | 'info'
  title: string
  description: string
  timestamp: Date
  entityType?: 'driver' | 'subcontractor' | 'document' | 'system'
  entityId?: string
  entityName?: string
  actionUrl?: string
  actionLabel?: string
  read?: boolean
}

export async function GET(request: NextRequest) {
  try {
    console.log('[v0] Generating system alerts...')
    const alerts: GeneratedAlert[] = []

    const adminClient = await createAdminClient()

    // 1. Alertas de cambios de estado de documentos (últimas 24 horas)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    try {
      const { data: statusChanges, error: statusError } = await adminClient
        .from('document_statuses')
        .select('*')
        .gte('changed_at', oneDayAgo)
        .order('changed_at', { ascending: false })
        .limit(10)

      if (!statusError && statusChanges && statusChanges.length > 0) {
        console.log('[v0] Found', statusChanges.length, 'recent document status changes')
        
        statusChanges.forEach((change) => {
          const statusText = change.status?.toLowerCase() || 'unknown'
          let alertType: 'warning' | 'error' | 'success' | 'info' = 'info'
          let title = 'Estado de documento actualizado'
          
          if (statusText === 'approved') {
            alertType = 'success'
            title = 'Documento aprobado'
          } else if (statusText === 'rejected') {
            alertType = 'error'
            title = 'Documento rechazado'
          } else if (statusText === 'expired') {
            alertType = 'warning'
            title = 'Documento vencido'
          }
          
          alerts.push({
            id: change.document_id || `status-${change.id}`,
            type: alertType,
            title,
            description: `${title}${change.reason ? ': ' + change.reason : ''}`,
            timestamp: new Date(change.changed_at),
            entityType: 'document',
            entityId: change.document_id,
            read: false,
          })
        })
      }
    } catch (statusFetchError) {
      console.warn('[v0] Could not fetch document status changes:', statusFetchError)
    }

    // 2. Alertas desde datos locales (fallback)
    const drivers = allDriversData || []
    const subcontractors = allSubcontractorsData || []

    // Conductores sin documentos completos
    const driversWithMissingDocs = drivers.filter((driver) => {
      const docs = driver.documentos || []
      return docs.length === 0 || docs.length < 3
    })

    if (driversWithMissingDocs.length > 0) {
      alerts.push({
        id: 'drivers-missing-documents',
        type: 'warning',
        title: 'Conductores sin documentación completa',
        description: `${driversWithMissingDocs.length} conductor(es) no tienen documentos o tienen documentación incompleta`,
        timestamp: new Date(),
        entityType: 'driver',
        entityName: 'Documentación incompleta',
        actionLabel: 'Ver conductores',
        actionUrl: '/dashboard/company/conductores',
        read: false,
      })
    }

    // Conductores inactivos
    const inactiveDrivers = drivers.filter((driver) => !driver.is_active).slice(0, 5)

    if (inactiveDrivers.length > 0) {
      alerts.push({
        id: 'inactive-drivers',
        type: 'info',
        title: 'Conductores inactivos en el sistema',
        description: `Hay ${inactiveDrivers.length} conductor(es) marcado(s) como inactivo(s)`,
        timestamp: new Date(),
        entityType: 'driver',
        entityName: 'Conductores inactivos',
        read: false,
      })
    }

    // Subcontratistas inactivos
    const inactiveSubcontractors = subcontractors.filter((sub) => !sub.is_active).slice(0, 5)

    if (inactiveSubcontractors.length > 0) {
      alerts.push({
        id: 'inactive-subcontractors',
        type: 'warning',
        title: 'Subcontratistas inactivos',
        description: `Hay ${inactiveSubcontractors.length} subcontratista(s) marcado(s) como inactivo(s)`,
        timestamp: new Date(),
        entityType: 'subcontractor',
        entityName: 'Subcontratistas inactivos',
        actionLabel: 'Revisar',
        actionUrl: '/dashboard/company/subcontratistas',
        read: false,
      })
    }

    // Estado del sistema
    alerts.push({
      id: 'system-status',
      type: 'info',
      title: 'Sistema operacional',
      description: `Sistema monitoreando ${drivers.length} conductores y ${subcontractors.length} subcontratistas`,
      timestamp: new Date(),
      entityType: 'system',
      entityName: 'Estado del sistema',
      read: true,
    })

    console.log('[v0] Generated', alerts.length, 'total alerts')
    return NextResponse.json({
      alerts,
      timestamp: new Date(),
      source: 'database_and_local',
    })
  } catch (error) {
    console.error('[v0] Error generating alerts:', error)
    return NextResponse.json(
      { 
        alerts: [],
        error: 'Error generating alerts', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 200 }
    )
  }
}

/**
 * Alertas por defecto si no hay BD disponible
 */
function getFallbackAlerts() {
  const drivers = allDriversData || []
  const subcontractors = allSubcontractorsData || []
  const alerts: GeneratedAlert[] = []

  const driversWithMissingDocs = drivers.filter((driver) => {
    const docs = driver.documentos || []
    return docs.length === 0 || docs.length < 3
  })

  if (driversWithMissingDocs.length > 0) {
    alerts.push({
      id: 'drivers-missing-documents',
      type: 'warning',
      title: 'Conductores sin documentación completa',
      description: `${driversWithMissingDocs.length} conductor(es) no tienen documentos o tienen documentación incompleta`,
      timestamp: new Date(),
      entityType: 'driver',
      actionUrl: '/dashboard/company/conductores',
      read: false,
    })
  }

  alerts.push({
    id: 'system-status',
    type: 'info',
    title: 'Sistema operacional',
    description: `Sistema monitoreando ${drivers.length} conductores y ${subcontractors.length} subcontratistas`,
    timestamp: new Date(),
    entityType: 'system',
    read: true,
  })

  return NextResponse.json({
    alerts,
    timestamp: new Date(),
    source: 'local_data_fallback',
  })
}
