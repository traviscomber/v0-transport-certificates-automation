'use server'

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { allDriversData } from '@/lib/data/all-drivers'
import { allSubcontractorsData } from '@/lib/data/all-subcontractors'
import { addDays, differenceInDays } from 'date-fns'

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
    const adminClient = createAdminClient()
    const alerts: GeneratedAlert[] = []

    // 1. Alertas de documentos próximos a vencer
    const today = new Date()
    const sevenDaysFromNow = addDays(today, 7)
    const fourteenDaysFromNow = addDays(today, 14)

    // Obtener documentos de conductores con fechas de vencimiento
    const { data: driverDocs } = await adminClient
      .from('driver_documents')
      .select('id, driver_id, document_type, created_at')
      .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())

    if (driverDocs && driverDocs.length > 0) {
      const expiringDocs = driverDocs.filter((doc) => {
        if (!doc.created_at) return false
        const expiryDate = addDays(new Date(doc.created_at), 365) // Asumir vencimiento en 1 año
        return expiryDate <= fourteenDaysFromNow && expiryDate >= today
      })

      if (expiringDocs.length > 0) {
        const daysWarning = expiringDocs.some((d) => {
          if (!d.created_at) return false
          const expiryDate = addDays(new Date(d.created_at), 365)
          return expiryDate <= sevenDaysFromNow
        })
          ? 7
          : 14

        alerts.push({
          id: 'expiring-driver-docs',
          type: daysWarning === 7 ? 'error' : 'warning',
          title: `Documentos de conductores próximos a vencer (${daysWarning} días)`,
          description: `Hay ${expiringDocs.length} documento(s) de conductor(es) que vence(n) en los próximos ${daysWarning} días`,
          timestamp: new Date(),
          entityType: 'document',
          entityName: 'Documentos de conductores',
          actionLabel: 'Ver conductores',
          read: false,
        })
      }
    }

    // 2. Alertas de documentos rechazados
    const { data: rejectedDocs } = await adminClient
      .from('driver_documents')
      .select('id, driver_id, document_type, status')
      .eq('status', 'rechazado')
      .limit(5)

    if (rejectedDocs && rejectedDocs.length > 0) {
      alerts.push({
        id: 'rejected-documents',
        type: 'error',
        title: 'Documentos rechazados',
        description: `Hay ${rejectedDocs.length} documento(s) que fueron rechazado(s) y requieren atención`,
        timestamp: new Date(),
        entityType: 'document',
        entityName: 'Documentos rechazados',
        actionLabel: 'Revisar',
        read: false,
      })
    }

    // 3. Alertas de documentos pendientes de verificación
    const { data: pendingDocs } = await adminClient
      .from('driver_documents')
      .select('id, driver_id')
      .eq('status', 'pendiente')
      .limit(10)

    if (pendingDocs && pendingDocs.length > 3) {
      alerts.push({
        id: 'pending-verification',
        type: 'info',
        title: 'Documentos en espera de verificación',
        description: `Hay ${pendingDocs.length} documento(s) esperando verificación de parte del sistema`,
        timestamp: new Date(),
        entityType: 'document',
        entityName: 'Documentos pendientes',
        actionLabel: 'Verificar',
        read: false,
      })
    }

    console.log('[v0] Generated', alerts.length, 'alerts')
    return NextResponse.json({
      alerts,
      timestamp: new Date(),
    })
  } catch (error) {
    console.error('[v0] Error generating alerts:', error)
    return NextResponse.json(
      { error: 'Error generating alerts', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
