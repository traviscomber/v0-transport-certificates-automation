/**
 * API: Review Queue Management
 * 
 * GET /api/v2/review-queue - Obtener cola de revisión
 * POST /api/v2/review-queue - Agregar documento a cola
 */

import { NextRequest, NextResponse } from 'next/server'
import { 
  getPendingReviews, 
  addToReviewQueue,
  getQueueStats,
  getNextReviewItem
} from '@/lib/human-in-the-loop'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get('action') || 'list'
    
    // Obtener estadísticas de la cola
    if (action === 'stats') {
      const { stats, error } = await getQueueStats()
      
      if (error) {
        return NextResponse.json({ success: false, error }, { status: 500 })
      }
      
      return NextResponse.json({ success: true, stats })
    }
    
    // Obtener siguiente item para revisar
    if (action === 'next') {
      const reviewerId = searchParams.get('reviewerId')
      const { item, error } = await getNextReviewItem(reviewerId || undefined)
      
      if (error) {
        return NextResponse.json({ success: false, error }, { status: 500 })
      }
      
      return NextResponse.json({ success: true, item })
    }
    
    // Listar cola de revisión
    const options = {
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0'),
      priority: searchParams.get('priority') || undefined,
      category: searchParams.get('category') || undefined,
      assignedTo: searchParams.get('assignedTo') || undefined,
      status: searchParams.get('status') || undefined
    }
    
    const { items, total, error } = await getPendingReviews(options)
    
    if (error) {
      return NextResponse.json({ success: false, error }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      items,
      total,
      pagination: {
        limit: options.limit,
        offset: options.offset,
        hasMore: options.offset + items.length < total
      }
    })
  } catch (err) {
    console.error('[API] Review queue GET error:', err)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { documentId, reviewReason, confidenceScore, flags, priority } = body
    
    if (!documentId) {
      return NextResponse.json(
        { success: false, error: 'documentId is required' },
        { status: 400 }
      )
    }
    
    if (!reviewReason) {
      return NextResponse.json(
        { success: false, error: 'reviewReason is required' },
        { status: 400 }
      )
    }
    
    const result = await addToReviewQueue(
      documentId,
      reviewReason,
      confidenceScore,
      flags || [],
      priority
    )
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      queueId: result.queueId,
      message: 'Document added to review queue'
    })
  } catch (err) {
    console.error('[API] Review queue POST error:', err)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
