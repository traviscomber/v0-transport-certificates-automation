export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAuth } from '@/lib/auth-middleware'
import { countActionableSubcontractorPending } from '@/lib/pending-document-semantics'

type TransportistaCertificationFlags = {
  ariztia: boolean | null
  lts: boolean | null
  rendic: boolean | null
  interpolar: boolean | null
}

type LegacyDocumentRow = {
  original_filename: string | null
  validation_status: string | null
  processed_at: string | null
  ai_processed_at: string | null
  ai_analyzed_at: string | null
  vision_processed_at: string | null
}

function normalizeFilename(value: string | null | undefined) {
  return value?.trim().toLowerCase() || ''
}

function legacyWasProcessed(doc: LegacyDocumentRow) {
  return Boolean(
    doc.validation_status === 'approved' ||
      doc.validation_status === 'rejected' ||
      doc.processed_at ||
      doc.ai_processed_at ||
      doc.ai_analyzed_at ||
      doc.vision_processed_at,
  )
}

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await verifyAuth(request)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    const countByStatus = async (table: string, statusColumn: string, status: string) => {
      const { count, error } = await supabase
        .from(table)
        .select('id', { count: 'exact', head: true })
        .eq('is_current', true)
        .eq(statusColumn, status)

      if (error) throw error
      return count || 0
    }

    const countCurrent = async (table: string) => {
      const { count, error } = await supabase
        .from(table)
        .select('id', { count: 'exact', head: true })
        .eq('is_current', true)

      if (error) throw error
      return count || 0
    }

    const countAll = async (table: string) => {
      const { count, error } = await supabase
        .from(table)
        .select('id', { count: 'exact', head: true })

      if (error) throw error
      return count || 0
    }

    const countCanonicalProcessed = async () => {
      const { count, error } = await supabase
        .from('subcontractor_documents')
        .select('id', { count: 'exact', head: true })
        .or('status.eq.approved,status.eq.rejected,ai_analyzed_at.not.is.null,reviewed_at.not.is.null,f30_validated_at.not.is.null')

      if (error) throw error
      return count || 0
    }

    const [
      conductorTotal,
      conductorManaged,
      conductorApproved,
      conductorRejected,
      conductorPending,
      subcontractorTotal,
      subcontractorManaged,
      subcontractorApproved,
      subcontractorRejected,
      subcontractorPending,
      canonicalProcessed,
      legacyDocumentsResult,
      transportistasResult,
    ] = await Promise.all([
      countCurrent('uploaded_documents'),
      countAll('uploaded_documents'),
      countByStatus('uploaded_documents', 'validation_status', 'approved'),
      countByStatus('uploaded_documents', 'validation_status', 'rejected'),
      countByStatus('uploaded_documents', 'validation_status', 'pending'),
      countCurrent('subcontractor_documents'),
      countAll('subcontractor_documents'),
      countByStatus('subcontractor_documents', 'status', 'approved'),
      countByStatus('subcontractor_documents', 'status', 'rejected'),
      countActionableSubcontractorPending(supabase),
      countCanonicalProcessed(),
      supabase
        .from('uploaded_documents')
        .select('original_filename,validation_status,processed_at,ai_processed_at,ai_analyzed_at,vision_processed_at'),
      supabase.from('transportistas').select('ariztia, lts, rendic, interpolar'),
    ])

    if (legacyDocumentsResult.error) throw legacyDocumentsResult.error
    if (transportistasResult.error) throw transportistasResult.error

    const legacyDocuments = (legacyDocumentsResult.data || []) as LegacyDocumentRow[]
    const legacyFilenames = Array.from(
      new Set(legacyDocuments.map((doc) => doc.original_filename).filter((name): name is string => Boolean(name))),
    )

    let canonicalLegacyFilenameKeys = new Set<string>()
    if (legacyFilenames.length > 0) {
      const { data: canonicalMatches, error: canonicalMatchesError } = await supabase
        .from('subcontractor_documents')
        .select('file_name')
        .in('file_name', legacyFilenames)

      if (canonicalMatchesError) throw canonicalMatchesError
      canonicalLegacyFilenameKeys = new Set(
        (canonicalMatches || [])
          .map((row) => normalizeFilename(row.file_name))
          .filter(Boolean),
      )
    }

    const uniqueLegacyDocuments = legacyDocuments.filter((doc) => {
      const key = normalizeFilename(doc.original_filename)
      return !key || !canonicalLegacyFilenameKeys.has(key)
    })
    const uniqueLegacyProcessed = uniqueLegacyDocuments.filter(legacyWasProcessed).length

    const lifetimeRegistered = subcontractorManaged + uniqueLegacyDocuments.length
    const lifetimeProcessed = canonicalProcessed + uniqueLegacyProcessed
    const lifetimeAwaitingProcessing = Math.max(lifetimeRegistered - lifetimeProcessed, 0)

    const certificationFlags = (transportistasResult.data || []) as TransportistaCertificationFlags[]
    const totalCertifications = certificationFlags.reduce((total, transportista) => {
      return total + [transportista.ariztia, transportista.lts, transportista.rendic, transportista.interpolar]
        .filter(Boolean).length
    }, 0)

    const stats = {
      conductores: {
        total: conductorTotal,
        processed: conductorManaged,
        pendientes: conductorPending,
        aprobados: conductorApproved,
        rechazados: conductorRejected,
        vencidos: 0,
      },
      subcontratistas: {
        total: subcontractorTotal,
        processed: subcontractorManaged,
        pendientes: subcontractorPending,
        aprobados: subcontractorApproved,
        rechazados: subcontractorRejected,
        vencidos: 0,
      },
      lifetime: {
        registered: lifetimeRegistered,
        processed: lifetimeProcessed,
        awaitingProcessing: lifetimeAwaitingProcessing,
        legacyUnique: uniqueLegacyDocuments.length,
        legacyMigrationDuplicatesExcluded: legacyDocuments.length - uniqueLegacyDocuments.length,
      },
      certificaciones: {
        total: totalCertifications,
        vigentes: totalCertifications,
        porVencer: 0,
        vencidas: 0,
      },
    }

    const response = NextResponse.json({ stats, timestamp: new Date().toISOString() })
    response.headers.set('Cache-Control', 'no-store, must-revalidate')
    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[v0] Stats API error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
