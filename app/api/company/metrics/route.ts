import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ALL_VALUE, getMonthYearRange } from '@/lib/date-filters'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type UploadedDocumentRow = {
  id: string
  conductor_id?: string | null
  validation_status?: string | null
  created_at?: string | null
  validated_at?: string | null
}

type SubcontractorDocumentRow = {
  id: string
  subcontractor_id?: string | null
  status?: string | null
  created_at?: string | null
  updated_at?: string | null
  approved_at?: string | null
  reviewed_at?: string | null
  reviewed_by_ejecutiva?: string | null
}

type ConductoreRow = {
  id: string
  rut_proveedor?: string | null
  is_active?: boolean | null
}

type TransportistaRow = {
  id: string
  rut?: string | null
  assigned_executive_id?: string | null
  ejecutivo_nombre?: string | null
  is_active?: boolean | null
}

type ExecutiveRow = {
  id: string
  full_name?: string | null
  is_active?: boolean | null
}

type ExecutiveMetric = {
  executive_id: string
  executive_name: string
  documents_processed: number
  avg_validation_time: number
  approval_rate: number
  avg_ai_confidence: number
  validation_date: string
  validated_count: number
  rejected_count: number
  pending_count: number
}

async function fetchAllRows<T>(query: any, batchSize = 1000): Promise<T[]> {
  const rows: T[] = []
  let start = 0

  while (true) {
    const { data, error } = await query.range(start, start + batchSize - 1)
    if (error) {
      throw error
    }

    const batch = (data || []) as T[]
    rows.push(...batch)

    if (batch.length < batchSize) {
      break
    }

    start += batchSize
  }

  return rows
}

function withinPeriod(dateValue: string | null | undefined, startDate?: Date, endDate?: Date) {
  if (!startDate || !endDate) return true
  if (!dateValue) return false

  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return false

  return date >= startDate && date <= endDate
}

export async function GET(request: NextRequest) {
  try {
    const userEmail = request.cookies.get('user_email')?.value
    if (!userEmail) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') || ALL_VALUE
    const year = searchParams.get('year') || ALL_VALUE
    const periodRange = getMonthYearRange(month, year)

    const supabase = createAdminClient()

    const uploadedQuery = supabase
      .from('uploaded_documents')
      .select('id, conductor_id, validation_status, created_at, validated_at')
      .order('created_at', { ascending: false })

    const subcontractorQuery = supabase
      .from('subcontractor_documents')
      .select('id, subcontractor_id, status, created_at, updated_at, approved_at, reviewed_at, reviewed_by_ejecutiva')
      .order('created_at', { ascending: false })

    const conductoresQuery = supabase
      .from('conductores')
      .select('id, rut_proveedor, is_active')

    const transportistasQuery = supabase
      .from('transportistas')
      .select('id, rut, assigned_executive_id, ejecutivo_nombre, is_active')

    const executivesQuery = supabase
      .from('executive_staff')
      .select('id, full_name, is_active')

    const [uploadedDocs, subcontractorDocs, conductores, transportistas, executives] = await Promise.all([
      fetchAllRows<UploadedDocumentRow>(
        periodRange
          ? uploadedQuery.gte('created_at', periodRange.start.toISOString()).lte('created_at', periodRange.end.toISOString())
          : uploadedQuery
      ),
      fetchAllRows<SubcontractorDocumentRow>(
        periodRange
          ? subcontractorQuery.gte('created_at', periodRange.start.toISOString()).lte('created_at', periodRange.end.toISOString())
          : subcontractorQuery
      ),
      fetchAllRows<ConductoreRow>(conductoresQuery),
      fetchAllRows<TransportistaRow>(transportistasQuery),
      fetchAllRows<ExecutiveRow>(executivesQuery),
    ])

    const executiveNameById = new Map<string, string>()
    const executiveNameByTransportistaId = new Map<string, string>()
    const transportistaByRut = new Map<string, TransportistaRow>()
    const transportistaById = new Map<string, TransportistaRow>()
    const conductorById = new Map<string, ConductoreRow>()

    executives.forEach((exec) => {
      if (exec.id) {
        executiveNameById.set(exec.id, exec.full_name || 'Sin nombre')
      }
    })

    transportistas.forEach((transportista) => {
      if (transportista.id) transportistaById.set(transportista.id, transportista)
      if (transportista.rut) transportistaByRut.set(transportista.rut, transportista)
      if (transportista.assigned_executive_id) {
        const execName = executiveNameById.get(transportista.assigned_executive_id)
        if (execName) {
          executiveNameByTransportistaId.set(transportista.id, execName)
        }
      }
    })

    conductores.forEach((conductor) => {
      if (conductor.id) conductorById.set(conductor.id, conductor)
    })

    const executiveMetrics = new Map<string, {
      executive_id: string
      executive_name: string
      documents_processed: number
      validated_count: number
      rejected_count: number
      pending_count: number
      total_validation_time: number
      validations_count: number
      conductores_activos: Set<string>
      averageConfidence: number
    }>()

    const resolveExecutiveNameFromConductor = (conductorId?: string | null) => {
      if (!conductorId) return null
      const conductor = conductorById.get(conductorId)
      if (!conductor?.rut_proveedor) return null
      const transportista = transportistaByRut.get(conductor.rut_proveedor)
      if (!transportista) return null
      if (transportista.assigned_executive_id) {
        return executiveNameById.get(transportista.assigned_executive_id) || transportista.ejecutivo_nombre || null
      }
      return transportista.ejecutivo_nombre || null
    }

    const resolveExecutiveNameFromTransportista = (transportistaId?: string | null) => {
      if (!transportistaId) return null
      const transportista = transportistaById.get(transportistaId)
      if (!transportista) return null
      if (transportista.assigned_executive_id) {
        return executiveNameById.get(transportista.assigned_executive_id) || transportista.ejecutivo_nombre || null
      }
      return transportista.ejecutivo_nombre || null
    }

    const ensureMetric = (executiveName: string) => {
      if (!executiveMetrics.has(executiveName)) {
        const executive = executives.find((item) => item.full_name === executiveName)
        executiveMetrics.set(executiveName, {
          executive_id: executive?.id || executiveName,
          executive_name: executiveName,
          documents_processed: 0,
          validated_count: 0,
          rejected_count: 0,
          pending_count: 0,
          total_validation_time: 0,
          validations_count: 0,
          conductores_activos: new Set<string>(),
          averageConfidence: 0,
        })
      }

      return executiveMetrics.get(executiveName)!
    }

    const registerDocument = (executiveName: string | null, status: string | null | undefined, createdAt?: string | null, validatedAt?: string | null, conductorId?: string | null) => {
      if (!executiveName) return

      const metric = ensureMetric(executiveName)
      metric.documents_processed += 1

      const normalizedStatus = (status || '').toLowerCase()
      if (normalizedStatus === 'approved' || normalizedStatus === 'validated') {
        metric.validated_count += 1
        if (createdAt && validatedAt) {
          const created = new Date(createdAt)
          const validated = new Date(validatedAt)
          if (!Number.isNaN(created.getTime()) && !Number.isNaN(validated.getTime())) {
            metric.total_validation_time += validated.getTime() - created.getTime()
            metric.validations_count += 1
          }
        }
      } else if (normalizedStatus === 'rejected') {
        metric.rejected_count += 1
      } else {
        metric.pending_count += 1
      }

      if (conductorId) {
        metric.conductores_activos.add(conductorId)
      }
    }

    uploadedDocs.forEach((doc) => {
      const executiveName = resolveExecutiveNameFromConductor(doc.conductor_id)
      registerDocument(
        executiveName,
        doc.validation_status,
        doc.created_at,
        doc.validated_at,
        doc.conductor_id || undefined
      )
    })

    subcontractorDocs.forEach((doc) => {
      const executiveName = resolveExecutiveNameFromTransportista(doc.subcontractor_id)
      const effectiveStatus = doc.status || null
      const validatedAt = doc.approved_at || doc.reviewed_at || doc.updated_at || null
      registerDocument(
        executiveName,
        effectiveStatus,
        doc.created_at,
        validatedAt,
        doc.subcontractor_id || undefined
      )
    })

    const executivesMetrics = Array.from(executiveMetrics.values()).map((metric) => {
      const approvalRate = metric.documents_processed > 0
        ? Math.round((metric.validated_count / metric.documents_processed) * 100)
        : 0

      const avgValidationSeconds = metric.validations_count > 0
        ? Math.round(metric.total_validation_time / metric.validations_count / 1000)
        : 0

      const performanceScore = Math.max(0, Math.min(100,
        Math.round(
          approvalRate * 0.6 +
          Math.max(0, 100 - Math.min(metric.rejected_count * 4, 100)) * 0.2 +
          Math.max(0, 100 - Math.min(avgValidationSeconds / 60, 100)) * 0.2
        )
      ))

      return {
        executive_id: metric.executive_id,
        executive_name: metric.executive_name,
        documents_processed: metric.documents_processed,
        avg_validation_time: avgValidationSeconds,
        approval_rate: approvalRate,
        avg_ai_confidence: 0,
        validation_date: periodRange ? periodRange.end.toISOString() : new Date().toISOString(),
        validated_count: metric.validated_count,
        rejected_count: metric.rejected_count,
        pending_count: metric.pending_count,
        performance_score: performanceScore,
        conductores_activos: metric.conductores_activos.size,
        tasa_validacion: `${approvalRate}%`,
        tasa_rechazo: metric.documents_processed > 0 ? `${Math.round((metric.rejected_count / metric.documents_processed) * 100)}%` : '0%',
        tiempo_promedio: avgValidationSeconds > 0
          ? `${Math.floor(avgValidationSeconds / 3600)}h ${Math.floor((avgValidationSeconds % 3600) / 60)}m`
          : '—',
      }
    }).sort((a, b) => b.performance_score - a.performance_score)

    const totalConductores = conductores.length
    const totalSubcontratistas = transportistas.length
    const totalDocuments = uploadedDocs.length + subcontractorDocs.length
    const totalValidated = uploadedDocs.filter((doc) => ['approved', 'validated'].includes((doc.validation_status || '').toLowerCase())).length +
      subcontractorDocs.filter((doc) => ['approved', 'validated'].includes((doc.status || '').toLowerCase())).length
    const totalRejected = uploadedDocs.filter((doc) => (doc.validation_status || '').toLowerCase() === 'rejected').length +
      subcontractorDocs.filter((doc) => (doc.status || '').toLowerCase() === 'rejected').length
    const totalPending = Math.max(totalDocuments - totalValidated - totalRejected, 0)

    const summary = {
      total_documents: totalDocuments,
      total_validados: totalValidated,
      total_conductores: totalConductores,
      total_subcontratistas: totalSubcontratistas,
      total_rechazados: totalRejected,
      total_pendientes: totalPending,
      period_month: month,
      period_year: year,
    }

    return NextResponse.json(
      {
        executives: executivesMetrics,
        summary,
      },
      {
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
        },
      }
    )
  } catch (error) {
    console.error('[v0] Error in GET /api/company/metrics:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error fetching metrics' },
      { status: 500 }
    )
  }
}
