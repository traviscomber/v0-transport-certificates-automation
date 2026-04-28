export const dynamic = 'force-dynamic'
export const revalidate = 0

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || 'week'

    // Calculate date range
    let daysBack = 7
    if (range === 'day') daysBack = 1
    if (range === 'month') daysBack = 30

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysBack)
    startDate.setHours(0, 0, 0, 0)

    console.log('[v0] Fetching metrics for range:', range, 'from:', startDate.toISOString())

    // Step 1: Get documents from the uploaded_documents table
    const { data: documents, error: docsError } = await supabase
      .from('uploaded_documents')
      .select('*')
      .gte('created_at', startDate.toISOString())

    if (docsError) {
      console.error('[v0] Error fetching documents:', docsError)
    }

    console.log('[v0] Found documents from uploaded_documents table:', documents?.length || 0)

    // Step 2: Get the 6 executives (hardcoded from Labbe - same as /api/company/data)
    const executives = [
      { id: '1', full_name: 'Olga Carrasco', rut: '10574005-0', email: 'ocarrasco@labbe.cl' },
      { id: '2', full_name: 'Carolina Sepúlveda', rut: '15464094-0', email: 'csepulveda@labbe.cl' },
      { id: '3', full_name: 'Daniela Silva', rut: '17768246-2', email: 'dsilva@labbe.cl' },
      { id: '4', full_name: 'Cecilia Farias', rut: '9888992-2', email: 'cfarias@labbe.cl' },
      { id: '5', full_name: 'Diego González', rut: '20114106-0', email: 'dgonzalez@labbe.cl' },
      { id: '6', full_name: 'Katherinne Canales', rut: '18717311-6', email: 'kcanales@labbe.cl' },
    ]

    // Step 3: Build metrics for each executive
    const metricsMap = new Map<string, any>()

    // Initialize all executives with 0 metrics
    executives.forEach((exec: any) => {
      metricsMap.set(exec.id, {
        executive_id: exec.id,
        executive_name: exec.full_name,
        documents_processed: 0,
        validated_count: 0,
        total_validation_time: 0,
      })
    })

    let totalDocuments = 0
    let totalValidated = 0
    let totalValidationTime = 0

    // Step 4: Process documents - link to executives by validated_by UUID
    if (documents && documents.length > 0) {
      documents.forEach((doc: any) => {
        // Only count documents that have been validated
        if (!doc.validated_by || doc.validation_status !== 'validated') {
          return
        }

        // The validated_by field contains a UUID, we need to match it with executive IDs
        // For now, since we have hardcoded executives, we'll skip if no validated_by
        const validatedBy = doc.validated_by
        
        // Try to find matching executive by ID (validated_by is a UUID)
        let matchingExec = executives.find((e: any) => e.id === validatedBy)

        // If not found and validated_by looks like an email, try matching by email
        if (!matchingExec && validatedBy && validatedBy.includes('@')) {
          matchingExec = executives.find((e: any) => e.email === validatedBy)
        }

        // If still no match, skip this document
        if (!matchingExec) {
          console.log('[v0] No matching executive found for validated_by:', validatedBy)
          return
        }

        totalDocuments++
        totalValidated++

        // Calculate validation time
        if (doc.created_at && doc.validated_at) {
          const createdTime = new Date(doc.created_at).getTime()
          const validatedTime = new Date(doc.validated_at).getTime()
          const timeSeconds = Math.round((validatedTime - createdTime) / 1000)
          totalValidationTime += timeSeconds
        }

        const metrics = metricsMap.get(matchingExec.id)
        metrics.documents_processed++
        metrics.validated_count++
        if (doc.created_at && doc.validated_at) {
          const createdTime = new Date(doc.created_at).getTime()
          const validatedTime = new Date(doc.validated_at).getTime()
          const timeSeconds = Math.round((validatedTime - createdTime) / 1000)
          metrics.total_validation_time += timeSeconds
        }
      })
    }

    // Format response with correct field names for frontend
    const executivesMetrics = Array.from(metricsMap.values()).map((m: any) => {
      const tasa = m.documents_processed > 0 
        ? Math.round((m.validated_count / m.documents_processed) * 100) 
        : 0
      const tiempo = m.documents_processed > 0
        ? Math.round(m.total_validation_time / m.documents_processed)
        : 0
      
      return {
        ejecutiva: m.executive_name,
        documentos_procesados: m.documents_processed,
        documentos_validados: m.validated_count,
        tasa_validacion: `${tasa}%`,
        tiempo_promedio: tiempo > 0 ? `${Math.floor(tiempo / 60)}m ${tiempo % 60}s` : '-',
      }
    })

    const summary = {
      total_documentos: totalDocuments,
      total_validados: totalValidated,
      total_conductores: 0, // TODO: Get from database
      total_subcontratistas: 0, // TODO: Get from database
    }

    console.log('[v0] Metrics calculated:', { 
      executives: executivesMetrics.length, 
      total_docs: totalDocuments,
      total_validated: totalValidated,
      metrics_by_exec: executivesMetrics.map(e => ({ name: e.ejecutiva, count: e.documentos_procesados }))
    })

    return NextResponse.json({
      executives: executivesMetrics.sort((a: any, b: any) => b.documents_processed - a.documents_processed),
      summary,
    })
  } catch (error) {
    console.error('[v0] Metrics endpoint error:', error)
    return NextResponse.json(
      { 
        executives: [],
        summary: {
          total_documents: 0,
          documents_increase: 0,
          avg_approval_rate: 0,
          avg_validation_time: 0,
        }
      },
      { status: 200 }
    )
  }
}
