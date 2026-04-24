'use server'

import { NextRequest, NextResponse } from 'next/server'
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

    // Use local data as fallback since driver_documents might not be populated
    const drivers = allDriversData || []
    const subcontractors = allSubcontractorsData || []

    // 1. Alertas para conductores sin documentos completos
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

    // 2. Alertas para conductores inactivos
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

    // 3. Alertas para subcontratistas inactivos
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

    // 4. Alertas de actividad general (system info)
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

    console.log('[v0] Generated', alerts.length, 'alerts')
    return NextResponse.json({
      alerts,
      timestamp: new Date(),
      source: 'local_data',
    })
  } catch (error) {
    console.error('[v0] Error generating alerts:', error)
    return NextResponse.json(
      { 
        alerts: [],
        error: 'Error generating alerts', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 200 } // Return 200 with empty alerts to prevent errors
    )
  }
}
