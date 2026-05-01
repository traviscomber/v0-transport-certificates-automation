import { createClient } from '@supabase/supabase-js'

export interface ConductorComplianceMetrics {
  conductorId: string
  conductorName: string
  rut: string
  totalDocuments: number
  approvedDocuments: number
  rejectedDocuments: number
  pendingDocuments: number
  expiredDocuments: number
  vigentDocuments: number
  complianceScore: number
  riskLevel: 'green' | 'yellow' | 'red'
  averageAiConfidence: number
  lastDocumentDate: string | null
  expiringDocuments: number
}

export interface ConductorComplianceReport {
  conductors: ConductorComplianceMetrics[]
  summary: {
    totalConductors: number
    averageComplianceScore: number
    highRiskCount: number
    mediumRiskCount: number
    lowRiskCount: number
  }
}

export async function getConductorComplianceMetrics(): Promise<ConductorComplianceReport> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )

  // STEP 1: Get all conductors first
  const { data: allConductors, error: conductorsError } = await supabase
    .from('conductores')
    .select('id, rut, nombres, apellido_paterno, apellido_materno, is_active')
    .eq('is_active', true)

  if (conductorsError) {
    console.error('[v0] Error fetching conductors:', conductorsError)
    throw new Error('Failed to fetch conductors')
  }

  // STEP 2: Get all documents
  const { data: documents, error: docsError } = await supabase
    .from('uploaded_documents')
    .select(`
      id,
      conductor_id,
      validation_status,
      extracted_expiration_date,
      extraction_confidence,
      created_at
    `)

  if (docsError) {
    console.error('[v0] Error fetching documents:', docsError)
    throw new Error('Failed to fetch compliance data')
  }

  // STEP 3: Initialize map with ALL conductors (even those without documents)
  const conductorMap = new Map<string, any>()
  
  allConductors?.forEach((conductor: any) => {
    const fullName = [conductor.nombres, conductor.apellido_paterno, conductor.apellido_materno]
      .filter(Boolean)
      .join(' ')
      .trim()
    conductorMap.set(conductor.id, {
      conductorId: conductor.id,
      conductorName: fullName || 'Sin nombre',
      rut: conductor.rut || 'N/A',
      totalDocuments: 0,
      approvedDocuments: 0,
      rejectedDocuments: 0,
      pendingDocuments: 0,
      expiredDocuments: 0,
      vigentDocuments: 0,
      totalConfidence: 0,
      documentDates: [],
      expiringDocuments: 0,
    })
  })

  // STEP 4: Populate metrics from documents
  documents?.forEach((doc: any) => {
    if (!doc.conductor_id) return

    const conductorId = doc.conductor_id
    if (!conductorMap.has(conductorId)) {
      // Create entry if conductor not in main list
      conductorMap.set(conductorId, {
        conductorId,
        conductorName: 'Unknown',
        rut: 'N/A',
        totalDocuments: 0,
        approvedDocuments: 0,
        rejectedDocuments: 0,
        pendingDocuments: 0,
        expiredDocuments: 0,
        vigentDocuments: 0,
        totalConfidence: 0,
        documentDates: [],
        expiringDocuments: 0,
      })
    }

    const conductor = conductorMap.get(conductorId)
    conductor.totalDocuments++

    // Count by status
    if (doc.validation_status === 'approved' || doc.validation_status === 'aprobado') {
      conductor.approvedDocuments++
    } else if (doc.validation_status === 'rejected' || doc.validation_status === 'rechazado') {
      conductor.rejectedDocuments++
    } else if (doc.validation_status === 'pending' || doc.validation_status === 'pendiente') {
      conductor.pendingDocuments++
    }

    // Check expiration
    if (doc.extracted_expiration_date) {
      const expDate = new Date(doc.extracted_expiration_date)
      const today = new Date()
      const daysUntilExp = Math.floor((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      if (daysUntilExp < 0) {
        conductor.expiredDocuments++
      } else if (daysUntilExp <= 30) {
        conductor.expiringDocuments++
        conductor.vigentDocuments++
      } else {
        conductor.vigentDocuments++
      }
    }

    // Track confidence
    if (doc.extraction_confidence) {
      conductor.totalConfidence += doc.extraction_confidence
    }

    // Track dates
    if (doc.created_at) {
      conductor.documentDates.push(doc.created_at)
    }
  })

  // STEP 5: Calculate final metrics for each conductor
  const conductors: ConductorComplianceMetrics[] = Array.from(conductorMap.values()).map((c: any) => {
    // Compliance score: percentage of approved/vigent documents
    // If NO documents: score is 0 (high risk)
    const validDocuments = c.approvedDocuments + c.vigentDocuments
    const complianceScore = c.totalDocuments > 0 ? Math.round((validDocuments / c.totalDocuments) * 100) : 0

    // Risk level: conductores sin documentos = RED (high risk)
    let riskLevel: 'green' | 'yellow' | 'red' = 'red' // Default to RED
    if (c.totalDocuments === 0) {
      riskLevel = 'red' // No documents = high risk
    } else if (complianceScore >= 80) {
      riskLevel = 'green'
    } else if (complianceScore >= 50) {
      riskLevel = 'yellow'
    }

    // Average AI confidence
    const averageAiConfidence = c.totalDocuments > 0 ? Math.round((c.totalConfidence / c.totalDocuments) * 100) / 100 : 0

    // Last document date
    const lastDocumentDate = c.documentDates.length > 0 
      ? new Date(Math.max(...c.documentDates.map((d: string) => new Date(d).getTime()))).toISOString()
      : null

    const result = {
      conductorId: c.conductorId,
      conductorName: c.conductorName,
      rut: c.rut,
      totalDocuments: c.totalDocuments,
      approvedDocuments: c.approvedDocuments,
      rejectedDocuments: c.rejectedDocuments,
      pendingDocuments: c.pendingDocuments,
      expiredDocuments: c.expiredDocuments,
      vigentDocuments: c.vigentDocuments,
      complianceScore,
      riskLevel,
      averageAiConfidence,
      lastDocumentDate,
      expiringDocuments: c.expiringDocuments,
    }
    
    return result
  })

  // STEP 6: Calculate summary
  const totalConductors = conductors.length
  const averageComplianceScore = totalConductors > 0 
    ? Math.round(conductors.reduce((sum, c) => sum + c.complianceScore, 0) / totalConductors)
    : 0
  const highRiskCount = conductors.filter(c => c.riskLevel === 'red').length
  const mediumRiskCount = conductors.filter(c => c.riskLevel === 'yellow').length
  const lowRiskCount = conductors.filter(c => c.riskLevel === 'green').length

  return {
    conductors: conductors.sort((a, b) => a.complianceScore - b.complianceScore),
    summary: {
      totalConductors,
      averageComplianceScore,
      highRiskCount,
      mediumRiskCount,
      lowRiskCount,
    },
  }
}
