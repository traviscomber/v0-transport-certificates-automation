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

    // Obtener la organization_id
    const { data: orgs, error: orgsError } = await adminClient
      .from('organizations')
      .select('id')
      .limit(1)

    if (orgsError || !orgs || orgs.length === 0) {
      console.warn('[v0] No organization found, returning fallback alerts')
      // Fallback a datos locales si no hay organización
      return getFallbackAlerts()
    }

    const organizationId = orgs[0].id

    // 1. Traer alertas recientes de la base de datos (últimas 24 horas)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    const { data: dbAlerts, error: dbError } = await adminClient
      .from('alerts_log')
      .select('*')
      .eq('organization_id', organizationId)
      .gte('created_at', oneDayAgo)
      .order('created_at', { ascending: false })
      .limit(20)

    if (dbError) {
      console.warn('[v0] Error fetching alerts from database:', dbError)
    } else if (dbAlerts && dbAlerts.length > 0) {
      console.log('[v0] Found', dbAlerts.length, 'alerts from database')
      
      // Convertir alertas de BD al formato esperado
      const dbAlertsFormatted = dbAlerts.map((alert, idx) => ({
        id: alert.id || `db-alert-${idx}`,
        type: mapAlertTypeToType(alert.alert_type),
        title: alert.title,
        description: alert.description || '',
        timestamp: new Date(alert.created_at),
        entityType: (alert.entity_type as any) || undefined,
        entityId: alert.entity_id,
        entityName: alert.entity_name,
        actionUrl: alert.action_url,
        read: alert.is_read,
      }))
      
      alerts.push(...dbAlertsFormatted)
    }

    // 2. Alertas adicionales desde datos locales (como fallback)
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
 * Mapea tipos de alertas de BD al formato esperado
 */
function mapAlertTypeToType(alertType: string): 'warning' | 'error' | 'success' | 'info' {
  const type = alertType.toLowerCase()
  if (type.includes('error') || type.includes('reject')) return 'error'
  if (type.includes('warning') || type.includes('expir')) return 'warning'
  if (type.includes('success') || type.includes('approv')) return 'success'
  return 'info'
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
