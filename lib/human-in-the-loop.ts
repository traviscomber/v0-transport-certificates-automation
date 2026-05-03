/**
 * FASE 2: Human-in-the-Loop System
 * Portal OCR Walmart Chile
 * 
 * Sistema de validación manual mejorada con:
 * - Cola de revisión priorizada
 * - Asignación inteligente de revisores
 * - Workflow de aprobación/rechazo
 * - Feedback loop para mejorar OCR
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { generateDocumentStatusChangeAlert } from '@/lib/document-alerts-generator'

// Types
export interface ReviewQueueItem {
  id: string
  documentId: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  status: 'pending' | 'in_review' | 'completed' | 'escalated'
  reviewReason: string
  confidenceScore: number | null
  flags: ValidationFlag[]
  assignedTo: string | null
  assignedAt: Date | null
  createdAt: Date
  slaDeadline: Date
  slaBreached: boolean
  // Joined data
  documentTypeCode?: string
  documentTypeName?: string
  documentCategory?: string
  extractedData?: Record<string, any>
  originalFilename?: string
  fileUrl?: string
  slaStatus?: 'ok' | 'warning' | 'urgent' | 'breached'
  hoursRemaining?: number
}

export interface ValidationFlag {
  code: string
  level: 'critical' | 'warning' | 'info'
  message: string
  field?: string
}

export interface ReviewDecision {
  queueId: string
  reviewerId: string
  decision: 'approved' | 'rejected' | 'needs_correction' | 'escalated'
  originalData?: Record<string, any>
  correctedData?: Record<string, any>
  correctionsMade?: FieldCorrection[]
  notes?: string
  rejectionReason?: string
}

export interface FieldCorrection {
  fieldName: string
  originalValue: string
  correctedValue: string
  errorType: 'misread' | 'missing' | 'extra_text' | 'format_error'
}

export interface ReviewerStats {
  reviewerId: string
  totalReviews: number
  approvedCount: number
  rejectedCount: number
  correctedCount: number
  avgReviewTimeSeconds: number
  accuracyRate: number
  slaComplianceRate: number
}

export interface QueueStats {
  total: number
  pending: number
  inReview: number
  completed: number
  escalated: number
  byPriority: {
    critical: number
    high: number
    medium: number
    low: number
  }
  slaBreach: {
    breached: number
    urgent: number
    warning: number
    ok: number
  }
  avgWaitTimeMinutes: number
}

// Use shared admin client (reads NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)
const getSupabaseAdmin = () => createAdminClient()

/**
 * Determina la prioridad basada en múltiples factores
 */
export function calculateReviewPriority(
  confidenceScore: number,
  flags: ValidationFlag[],
  documentCategory: string
): 'critical' | 'high' | 'medium' | 'low' {
  // Contar flags críticos
  const criticalFlags = flags.filter(f => f.level === 'critical').length
  const warningFlags = flags.filter(f => f.level === 'warning').length
  
  // Documentos de conductor/vehículo son más críticos
  const isCriticalCategory = ['conductor', 'vehiculo'].includes(documentCategory)
  
  // Lógica de prioridad
  if (criticalFlags >= 2 || confidenceScore < 0.5) {
    return 'critical'
  }
  
  if (criticalFlags >= 1 || confidenceScore < 0.65 || (isCriticalCategory && warningFlags >= 2)) {
    return 'high'
  }
  
  if (warningFlags >= 2 || confidenceScore < 0.8) {
    return 'medium'
  }
  
  return 'low'
}

/**
 * Agrega un documento a la cola de revisión
 */
export async function addToReviewQueue(
  documentId: string,
  reviewReason: string,
  confidenceScore?: number,
  flags: ValidationFlag[] = [],
  priority?: 'critical' | 'high' | 'medium' | 'low'
): Promise<{ success: boolean; queueId?: string; error?: string }> {
  try {
    const supabase = getSupabaseAdmin()
    
    // Si no se especifica prioridad, usar función de BD
    const { data, error } = await supabase.rpc('add_to_review_queue', {
      p_document_id: documentId,
      p_review_reason: reviewReason,
      p_confidence_score: confidenceScore ?? null,
      p_flags: JSON.stringify(flags),
      p_priority: priority ?? null
    })
    
    if (error) {
      console.error('[HITL] Error adding to queue:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, queueId: data }
  } catch (err) {
    console.error('[HITL] Exception adding to queue:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

/**
 * Obtiene la cola de revisión pendiente
 */
export async function getPendingReviews(options: {
  limit?: number
  offset?: number
  priority?: string
  category?: string
  assignedTo?: string
  status?: string
} = {}): Promise<{ items: ReviewQueueItem[]; total: number; error?: string }> {
  try {
    const supabase = getSupabaseAdmin()
    const { limit = 20, offset = 0, priority, category, assignedTo, status } = options
    
    let query = supabase
      .from('pending_reviews')
      .select('*', { count: 'exact' })
    
    if (priority) {
      query = query.eq('priority', priority)
    }
    if (category) {
      query = query.eq('document_category', category)
    }
    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo)
    }
    if (status) {
      query = query.eq('status', status)
    }
    
    query = query.range(offset, offset + limit - 1)
    
    const { data, error, count } = await query
    
    if (error) {
      console.error('[HITL] Error fetching queue:', error)
      return { items: [], total: 0, error: error.message }
    }
    
    const items: ReviewQueueItem[] = (data || []).map(row => ({
      id: row.id,
      documentId: row.document_id,
      priority: row.priority,
      status: row.status,
      reviewReason: row.review_reason,
      confidenceScore: row.confidence_score,
      flags: row.flags || [],
      assignedTo: row.assigned_to,
      assignedAt: row.assigned_at ? new Date(row.assigned_at) : null,
      createdAt: new Date(row.created_at),
      slaDeadline: new Date(row.sla_deadline),
      slaBreached: row.sla_breached,
      documentTypeCode: row.document_type_code,
      documentTypeName: row.document_type_name,
      documentCategory: row.document_category,
      extractedData: row.extracted_data,
      originalFilename: row.original_filename,
      fileUrl: row.file_url,
      slaStatus: row.sla_status,
      hoursRemaining: row.hours_remaining
    }))
    
    return { items, total: count || 0 }
  } catch (err) {
    console.error('[HITL] Exception fetching queue:', err)
    return { items: [], total: 0, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

/**
 * Obtiene el siguiente item a revisar (round-robin por prioridad)
 */
export async function getNextReviewItem(
  reviewerId?: string
): Promise<{ item: ReviewQueueItem | null; error?: string }> {
  try {
    const supabase = getSupabaseAdmin()
    
    // Buscar item pendiente no asignado, ordenado por prioridad y SLA
    const { data, error } = await supabase
      .from('pending_reviews')
      .select('*')
      .eq('status', 'pending')
      .is('assigned_to', null)
      .order('priority', { ascending: true })
      .order('sla_deadline', { ascending: true })
      .limit(1)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No items found
        return { item: null }
      }
      return { item: null, error: error.message }
    }
    
    if (!data) {
      return { item: null }
    }
    
    const item: ReviewQueueItem = {
      id: data.id,
      documentId: data.document_id,
      priority: data.priority,
      status: data.status,
      reviewReason: data.review_reason,
      confidenceScore: data.confidence_score,
      flags: data.flags || [],
      assignedTo: data.assigned_to,
      assignedAt: data.assigned_at ? new Date(data.assigned_at) : null,
      createdAt: new Date(data.created_at),
      slaDeadline: new Date(data.sla_deadline),
      slaBreached: data.sla_breached,
      documentTypeCode: data.document_type_code,
      documentTypeName: data.document_type_name,
      documentCategory: data.document_category,
      extractedData: data.extracted_data,
      originalFilename: data.original_filename,
      fileUrl: data.file_url,
      slaStatus: data.sla_status,
      hoursRemaining: data.hours_remaining
    }
    
    return { item }
  } catch (err) {
    console.error('[HITL] Exception getting next item:', err)
    return { item: null, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

/**
 * Asigna una revisión a un revisor
 */
export async function assignReview(
  queueId: string,
  reviewerId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase.rpc('assign_review', {
      p_queue_id: queueId,
      p_reviewer_id: reviewerId
    })
    
    if (error) {
      return { success: false, error: error.message }
    }
    
    return { success: data === true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

/**
 * Completa una revisión con decisión
 */
export async function completeReview(
  decision: ReviewDecision
): Promise<{ success: boolean; decisionId?: string; error?: string }> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase.rpc('complete_review', {
      p_queue_id: decision.queueId,
      p_reviewer_id: decision.reviewerId,
      p_decision: decision.decision,
      p_original_data: decision.originalData ? JSON.stringify(decision.originalData) : null,
      p_corrected_data: decision.correctedData ? JSON.stringify(decision.correctedData) : null,
      p_corrections: JSON.stringify(decision.correctionsMade || []),
      p_notes: decision.notes || null,
      p_rejection_reason: decision.rejectionReason || null
    })
    
    if (error) {
      return { success: false, error: error.message }
    }
    
    // Si hay correcciones, guardar feedback para entrenar OCR
    if (decision.correctionsMade && decision.correctionsMade.length > 0) {
      await saveOCRFeedback(decision)
    }
    
    // Actualizar documento original si fue aprobado/corregido
    if (decision.decision === 'approved' || decision.decision === 'needs_correction') {
      await updateDocumentAfterReview(decision)
    }

    // Generar alertas de cambio de estado
    if (decision.decision === 'approved' || decision.decision === 'rejected') {
      try {
        await generateReviewAlerts(decision)
      } catch (alertError) {
        console.error('[v0] Error generating review alerts:', alertError)
      }
    }
    
    return { success: true, decisionId: data }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

/**
 * Genera alertas cuando se completa la revisión (aprobado/rechazado)
 */
async function generateReviewAlerts(decision: ReviewDecision): Promise<void> {
  try {
    const supabase = getSupabaseAdmin()
    
    console.log('[HITL] 📢 Generating alerts for review decision:', decision.decision)
    console.log('[HITL] Queue ID:', decision.queueId)
    console.log('[HITL] Rejection reason:', decision.rejectionReason)
    
    // Obtener información de la cola de revisión
    const { data: queueItem, error: queueError } = await supabase
      .from('review_queue')
      .select('document_id')
      .eq('id', decision.queueId)
      .single()
    
    console.log('[HITL] Queue fetch result:', { queueItem, queueError })
    
    if (queueError || !queueItem) {
      console.error('[HITL] ❌ Error fetching queue item:', queueError)
      return
    }

    const documentId = queueItem.document_id
    console.log('[HITL] Document ID from queue:', documentId)
    
    // Obtener documento uploadado CON la relación a document_types
    const { data: uploadedDoc, error: docError } = await supabase
      .from('uploaded_documents')
      .select(`
        id,
        conductor_id,
        document_type_id,
        document_types (
          id,
          name
        )
      `)
      .eq('id', documentId)
      .single()
    
    console.log('[HITL] Document fetch result:', { uploadedDoc, docError })
    
    if (docError || !uploadedDoc) {
      console.error('[HITL] ❌ Error fetching uploaded document:', docError)
      return
    }

    // Obtener nombre del conductor
    const { data: conductorData, error: conductorError } = await supabase
      .from('conductores')
      .select('nombres, apellido_paterno, apellido_materno')
      .eq('id', uploadedDoc.conductor_id)
      .single()

    console.log('[HITL] Conductor fetch result:', { conductorData, conductorError })

    const conductorName = conductorData 
      ? [conductorData.nombres, conductorData.apellido_paterno, conductorData.apellido_materno]
          .filter(Boolean)
          .join(' ')
          .trim()
      : 'Conductor'

    console.log('[HITL] Conductor name:', conductorName)
    console.log('[HITL] Calling generateDocumentStatusChangeAlert with:', {
      documentId: uploadedDoc.id,
      documentType: (uploadedDoc as any).document_types?.name,
      conductorName,
      conductorId: uploadedDoc.conductor_id,
      status: decision.decision === 'approved' ? 'approved' : 'rejected',
      reason: decision.rejectionReason
    })

    // Generar alerta con el nuevo sistema - pasar el nombre ya resuelto
    await generateDocumentStatusChangeAlert(
      uploadedDoc.id,
      (uploadedDoc as any).document_types?.name || 'Documento',
      conductorName,  // Already resolved above
      uploadedDoc.conductor_id,
      decision.decision === 'approved' ? 'approved' : 'rejected',
      decision.rejectionReason || decision.notes || undefined
    )
    
    console.log('[HITL] ✅ Alert generated successfully')
  } catch (err) {
    console.error('[HITL] ❌ Error generating review alerts:', err)
  }
}

/**
 * Guarda feedback de correcciones para mejorar OCR
 */
async function saveOCRFeedback(decision: ReviewDecision): Promise<void> {
  if (!decision.correctionsMade || decision.correctionsMade.length === 0) return
  
  try {
    const supabase = getSupabaseAdmin()
    
    // Obtener tipo de documento
    const { data: queueItem } = await supabase
      .from('review_queue')
      .select(`
        document_id,
        confidence_score,
        uploaded_documents!inner(
          document_type_id,
          document_types!inner(code)
        )
      `)
      .eq('id', decision.queueId)
      .single()
    
    if (!queueItem) return
    
    const documentTypeCode = (queueItem as any).uploaded_documents?.document_types?.code || 'unknown'
    
    // Guardar cada corrección como feedback
    const feedbackRecords = decision.correctionsMade.map(correction => ({
      document_type_code: documentTypeCode,
      field_name: correction.fieldName,
      original_value: correction.originalValue,
      corrected_value: correction.correctedValue,
      ocr_confidence: queueItem.confidence_score,
      error_type: correction.errorType,
      used_for_training: false
    }))
    
    await supabase.from('ocr_feedback').insert(feedbackRecords)
  } catch (err) {
    console.error('[HITL] Error saving OCR feedback:', err)
  }
}

/**
 * Actualiza el documento después de la revisión
 */
async function updateDocumentAfterReview(decision: ReviewDecision): Promise<void> {
  try {
    const supabase = getSupabaseAdmin()
    
    // Obtener document_id del queue
    const { data: queueItem } = await supabase
      .from('review_queue')
      .select('document_id')
      .eq('id', decision.queueId)
      .single()
    
    if (!queueItem) return
    
    // Actualizar documento
    const updateData: Record<string, any> = {
      validation_status: decision.decision === 'approved' ? 'validated' : 'corrected',
      validated_at: new Date().toISOString(),
      validation_notes: decision.notes
    }
    
    // Si hay datos corregidos, actualizarlos
    if (decision.correctedData) {
      updateData.extracted_data = decision.correctedData
    }
    
    await supabase
      .from('uploaded_documents')
      .update(updateData)
      .eq('id', queueItem.document_id)
  } catch (err) {
    console.error('[HITL] Error updating document:', err)
  }
}

/**
 * Obtiene estadísticas de la cola
 */
export async function getQueueStats(): Promise<{ stats: QueueStats; error?: string }> {
  try {
    const supabase = getSupabaseAdmin()
    
    // Conteo general
    const { data: counts, error: countError } = await supabase
      .from('review_queue')
      .select('status, priority, sla_breached, sla_deadline, created_at')
    
    if (countError) {
      return { 
        stats: getEmptyStats(), 
        error: countError.message 
      }
    }
    
    const now = new Date()
    const stats: QueueStats = {
      total: counts?.length || 0,
      pending: 0,
      inReview: 0,
      completed: 0,
      escalated: 0,
      byPriority: { critical: 0, high: 0, medium: 0, low: 0 },
      slaBreach: { breached: 0, urgent: 0, warning: 0, ok: 0 },
      avgWaitTimeMinutes: 0
    }
    
    let totalWaitMinutes = 0
    let pendingCount = 0
    
    for (const item of counts || []) {
      // Por status
      if (item.status === 'pending') stats.pending++
      else if (item.status === 'in_review') stats.inReview++
      else if (item.status === 'completed') stats.completed++
      else if (item.status === 'escalated') stats.escalated++
      
      // Por prioridad
      if (item.priority in stats.byPriority) {
        stats.byPriority[item.priority as keyof typeof stats.byPriority]++
      }
      
      // SLA status
      if (item.status === 'pending' || item.status === 'in_review') {
        const deadline = new Date(item.sla_deadline)
        const hoursRemaining = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60)
        
        if (item.sla_breached || hoursRemaining < 0) {
          stats.slaBreach.breached++
        } else if (hoursRemaining < 1) {
          stats.slaBreach.urgent++
        } else if (hoursRemaining < 4) {
          stats.slaBreach.warning++
        } else {
          stats.slaBreach.ok++
        }
        
        // Calcular tiempo de espera
        const waitMinutes = (now.getTime() - new Date(item.created_at).getTime()) / (1000 * 60)
        totalWaitMinutes += waitMinutes
        pendingCount++
      }
    }
    
    if (pendingCount > 0) {
      stats.avgWaitTimeMinutes = Math.round(totalWaitMinutes / pendingCount)
    }
    
    return { stats }
  } catch (err) {
    return { 
      stats: getEmptyStats(), 
      error: err instanceof Error ? err.message : 'Unknown error' 
    }
  }
}

function getEmptyStats(): QueueStats {
  return {
    total: 0,
    pending: 0,
    inReview: 0,
    completed: 0,
    escalated: 0,
    byPriority: { critical: 0, high: 0, medium: 0, low: 0 },
    slaBreach: { breached: 0, urgent: 0, warning: 0, ok: 0 },
    avgWaitTimeMinutes: 0
  }
}

/**
 * Obtiene estadísticas de un revisor
 */
export async function getReviewerStats(
  reviewerId: string,
  periodDays: number = 30
): Promise<{ stats: ReviewerStats; error?: string }> {
  try {
    const supabase = getSupabaseAdmin()
    
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - periodDays)
    
    const { data, error } = await supabase
      .from('review_decisions')
      .select('decision, review_duration_seconds, created_at')
      .eq('reviewer_id', reviewerId)
      .gte('created_at', startDate.toISOString())
    
    if (error) {
      return {
        stats: getEmptyReviewerStats(reviewerId),
        error: error.message
      }
    }
    
    const stats: ReviewerStats = {
      reviewerId,
      totalReviews: data?.length || 0,
      approvedCount: 0,
      rejectedCount: 0,
      correctedCount: 0,
      avgReviewTimeSeconds: 0,
      accuracyRate: 0,
      slaComplianceRate: 0
    }
    
    let totalDuration = 0
    
    for (const review of data || []) {
      if (review.decision === 'approved') stats.approvedCount++
      else if (review.decision === 'rejected') stats.rejectedCount++
      else if (review.decision === 'needs_correction') stats.correctedCount++
      
      totalDuration += review.review_duration_seconds || 0
    }
    
    if (stats.totalReviews > 0) {
      stats.avgReviewTimeSeconds = Math.round(totalDuration / stats.totalReviews)
      stats.accuracyRate = (stats.approvedCount + stats.correctedCount) / stats.totalReviews
    }
    
    return { stats }
  } catch (err) {
    return {
      stats: getEmptyReviewerStats(reviewerId),
      error: err instanceof Error ? err.message : 'Unknown error'
    }
  }
}

function getEmptyReviewerStats(reviewerId: string): ReviewerStats {
  return {
    reviewerId,
    totalReviews: 0,
    approvedCount: 0,
    rejectedCount: 0,
    correctedCount: 0,
    avgReviewTimeSeconds: 0,
    accuracyRate: 0,
    slaComplianceRate: 0
  }
}

/**
 * Obtiene feedback de OCR para entrenamiento
 */
export async function getOCRFeedbackForTraining(
  documentTypeCode?: string,
  limit: number = 100
): Promise<{ feedback: any[]; error?: string }> {
  try {
    const supabase = getSupabaseAdmin()
    
    let query = supabase
      .from('ocr_feedback')
      .select('*')
      .eq('used_for_training', false)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (documentTypeCode) {
      query = query.eq('document_type_code', documentTypeCode)
    }
    
    const { data, error } = await query
    
    if (error) {
      return { feedback: [], error: error.message }
    }
    
    return { feedback: data || [] }
  } catch (err) {
    return { feedback: [], error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

/**
 * Marca feedback como usado para entrenamiento
 */
export async function markFeedbackAsUsed(feedbackIds: string[]): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { error } = await supabase
      .from('ocr_feedback')
      .update({ used_for_training: true })
      .in('id', feedbackIds)
    
    if (error) {
      return { success: false, error: error.message }
    }
    
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}
