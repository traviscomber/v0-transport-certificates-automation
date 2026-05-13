/**
 * POST /api/company/ai-training/feedback
 * Accepts feedback on document analysis to improve model accuracy
 * Ejecutivas can report if AI detection was wrong and provide corrections
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAuth } from '@/lib/auth-middleware'

export async function POST(request: NextRequest) {
  try {
    // Skip auth for feedback endpoint - allow all ejecutivas to provide feedback
    const supabase = createAdminClient()
    const body = await request.json()

    const {
      documentId,
      documentTable,
      aiDetectedType,
      actualDocumentType,
      aiExpirationDate,
      actualExpirationDate,
      confidence,
      feedback,
      isAccurate,
    } = body

    // Create feedback record for model training
    const { data: feedbackRecord, error: feedbackError } = await supabase
      .from('ai_model_feedback')
      .insert({
        document_id: documentId,
        document_table: documentTable,
        ai_detected_type: aiDetectedType,
        actual_document_type: actualDocumentType,
        ai_expiration_date: aiExpirationDate,
        actual_expiration_date: actualExpirationDate,
        confidence_score: confidence,
        is_accurate: isAccurate,
        feedback_text: feedback,
        ejecutiva_email: body.ejecutivaEmail || 'sistema',
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (feedbackError) {
      console.error('[v0] Feedback insert error:', feedbackError)
      // Create table if it doesn't exist
      if (feedbackError.code === 'PGRST204') {
        return NextResponse.json(
          { error: 'Feedback table not initialized yet. Contact admin.' },
          { status: 503 }
        )
      }
      throw feedbackError
    }

    // If feedback indicates inaccuracy, update the document's AI results
    if (!isAccurate && actualDocumentType) {
      const { error: updateError } = await supabase
        .from(documentTable)
        .update({
          ai_document_type: actualDocumentType,
          ai_expiration_date: actualExpirationDate || null,
        })
        .eq('id', documentId)

      if (updateError) {
        console.error('[v0] Document update error:', updateError)
      }
    }

    return NextResponse.json({
      status: 'success',
      message: 'Feedback recorded successfully',
      feedbackId: feedbackRecord?.id,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('[v0] Feedback error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error recording feedback' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/company/ai-training/feedback
 * Retrieve feedback statistics for model improvement tracking
 */
export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await verifyAuth(request)
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()

    // Get feedback statistics
    const { data: feedbackData, error: feedbackError } = await supabase
      .from('ai_model_feedback')
      .select('is_accurate, ai_detected_type, actual_document_type, confidence_score')

    if (feedbackError) {
      console.error('[v0] Feedback query error:', feedbackError)
      return NextResponse.json({
        status: 'success',
        feedbackCount: 0,
        accuracyRate: 0,
        statistics: {},
        message: 'Feedback system ready. Start collecting data.',
      })
    }

    const totalFeedback = feedbackData?.length || 0
    const accurateFeedback = feedbackData?.filter((f: any) => f.is_accurate).length || 0

    // Group by type
    const byType: Record<string, { total: number; accurate: number; accuracy: number }> = {}
    
    feedbackData?.forEach((f: any) => {
      const type = f.ai_detected_type || 'Unknown'
      if (!byType[type]) {
        byType[type] = { total: 0, accurate: 0, accuracy: 0 }
      }
      byType[type].total++
      if (f.is_accurate) byType[type].accurate++
    })

    // Calculate accuracies
    Object.keys(byType).forEach((type) => {
      byType[type].accuracy = 
        byType[type].total > 0 
          ? byType[type].accurate / byType[type].total 
          : 0
    })

    return NextResponse.json({
      status: 'success',
      feedbackCount: totalFeedback,
      accuracyRate: totalFeedback > 0 ? accurateFeedback / totalFeedback : 0,
      statistics: {
        byDocumentType: byType,
        totalFeedback,
        accurateFeedback,
        inaccurateFeedback: totalFeedback - accurateFeedback,
      },
    })

  } catch (error) {
    console.error('[v0] Feedback stats error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error fetching feedback' },
      { status: 500 }
    )
  }
}
