/**
 * API: Review Actions
 * 
 * GET /api/v2/review-queue/[id] - Obtener detalle de revisión
 * POST /api/v2/review-queue/[id] - Acciones: assign, complete, escalate
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { 
  assignReview, 
  completeReview,
  ReviewDecision
} from '@/lib/human-in-the-loop'

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not configured')
  }
  
  return createClient(supabaseUrl, supabaseKey)
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = getSupabaseAdmin()
    
    // Obtener detalle de la revisión con documento
    const { data, error } = await supabase
      .from('pending_reviews')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Review not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }
    
    // También obtener historial de decisiones si existe
    const { data: decisions } = await supabase
      .from('review_decisions')
      .select('*')
      .eq('queue_id', id)
      .order('created_at', { ascending: false })
    
    return NextResponse.json({
      success: true,
      review: {
        id: data.id,
        documentId: data.document_id,
        priority: data.priority,
        status: data.status,
        reviewReason: data.review_reason,
        confidenceScore: data.confidence_score,
        flags: data.flags,
        assignedTo: data.assigned_to,
        slaDeadline: data.sla_deadline,
        slaStatus: data.sla_status,
        hoursRemaining: data.hours_remaining,
        createdAt: data.created_at,
        document: {
          typeCode: data.document_type_code,
          typeName: data.document_type_name,
          category: data.document_category,
          extractedData: data.extracted_data,
          filename: data.original_filename,
          fileUrl: data.file_url
        }
      },
      decisions: decisions || []
    })
  } catch (err) {
    console.error('[API] Review GET error:', err)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { action, reviewerId, ...actionData } = body
    
    if (!action) {
      return NextResponse.json(
        { success: false, error: 'action is required' },
        { status: 400 }
      )
    }
    
    if (!reviewerId) {
      return NextResponse.json(
        { success: false, error: 'reviewerId is required' },
        { status: 400 }
      )
    }
    
    // Acción: Asignar revisión
    if (action === 'assign') {
      const result = await assignReview(id, reviewerId)
      
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error || 'Failed to assign' },
          { status: 500 }
        )
      }
      
      return NextResponse.json({
        success: true,
        message: 'Review assigned successfully'
      })
    }
    
    // Acción: Completar revisión
    if (action === 'complete') {
      const { decision, originalData, correctedData, corrections, notes, rejectionReason } = actionData
      
      if (!decision) {
        return NextResponse.json(
          { success: false, error: 'decision is required' },
          { status: 400 }
        )
      }
      
      if (!['approved', 'rejected', 'needs_correction', 'escalated'].includes(decision)) {
        return NextResponse.json(
          { success: false, error: 'Invalid decision. Must be: approved, rejected, needs_correction, or escalated' },
          { status: 400 }
        )
      }
      
      const reviewDecision: ReviewDecision = {
        queueId: id,
        reviewerId,
        decision,
        originalData,
        correctedData,
        correctionsMade: corrections,
        notes,
        rejectionReason
      }
      
      const result = await completeReview(reviewDecision)
      
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 500 }
        )
      }
      
      return NextResponse.json({
        success: true,
        decisionId: result.decisionId,
        message: `Review ${decision} successfully`
      })
    }
    
    // Acción: Escalar
    if (action === 'escalate') {
      const supabase = getSupabaseAdmin()
      
      const { error } = await supabase
        .from('review_queue')
        .update({
          status: 'escalated',
          priority: 'critical'
        })
        .eq('id', id)
      
      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        )
      }
      
      return NextResponse.json({
        success: true,
        message: 'Review escalated to supervisor'
      })
    }
    
    return NextResponse.json(
      { success: false, error: `Unknown action: ${action}` },
      { status: 400 }
    )
  } catch (err) {
    console.error('[API] Review POST error:', err)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
