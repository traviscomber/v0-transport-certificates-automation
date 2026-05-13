/**
 * GET /api/company/ai-training/document-analysis
 * Analyzes document uploads to understand patterns for model training
 * Returns statistics on document types, confidence scores, extraction accuracy
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAuth } from '@/lib/auth-middleware'

export const dynamic = 'force-dynamic'
export const revalidate = 60 // Cache for 1 minute

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

    // Analyze subcontractor documents with AI analysis
    const { data: subDocs, error: subError } = await supabase
      .from('subcontractor_documents')
      .select('ai_document_type, ai_confidence, ai_expiration_date, ai_analyzed_at, document_type, created_at')
      .not('ai_document_type', 'is', null)

    // Analyze conductor/driver documents
    const { data: driverDocs, error: driverError } = await supabase
      .from('uploaded_documents')
      .select('ai_document_type, ai_confidence, ai_expiration_date, ai_analyzed_at, document_type, created_at')
      .not('ai_document_type', 'is', null)

    if (subError) console.error('[v0] Subcontractor docs error:', subError)
    if (driverError) console.error('[v0] Driver docs error:', driverError)

    const allDocs = [...(subDocs || []), ...(driverDocs || [])]

    // Calculate statistics
    const stats = {
      totalAnalyzed: allDocs.length,
      documentTypes: {} as Record<string, { count: number; accuracy: number; expirationDetectionRate: number }>,
      confidenceDistribution: {
        veryHigh: 0, // > 0.9
        high: 0,     // 0.7-0.9
        medium: 0,   // 0.5-0.7
        low: 0,      // < 0.5
      },
      expirationDateDetection: {
        detected: 0,
        notDetected: 0,
        detectionRate: 0,
      },
      averageConfidence: 0,
      lastAnalyzedDocuments: [] as any[],
      documentTypeAccuracy: {} as Record<string, number>,
      timeToAnalyze: {
        average: 0,
        min: Infinity,
        max: 0,
      },
    }

    // Confidence scores and detection rates
    let totalConfidence = 0
    const analyzeTimestamps: number[] = []

    allDocs.forEach((doc: any) => {
      const detectedType = doc.ai_document_type || 'Unknown'
      const confidence = doc.ai_confidence || 0

      // Track document types
      if (!stats.documentTypes[detectedType]) {
        stats.documentTypes[detectedType] = {
          count: 0,
          accuracy: 0,
          expirationDetectionRate: 0,
        }
      }
      stats.documentTypes[detectedType].count++

      // Confidence distribution
      if (confidence > 0.9) stats.confidenceDistribution.veryHigh++
      else if (confidence > 0.7) stats.confidenceDistribution.high++
      else if (confidence > 0.5) stats.confidenceDistribution.medium++
      else stats.confidenceDistribution.low++

      // Expiration date detection
      if (doc.ai_expiration_date) {
        stats.expirationDateDetection.detected++
      } else {
        stats.expirationDateDetection.notDetected++
      }

      totalConfidence += confidence

      // Time to analyze
      if (doc.ai_analyzed_at && doc.created_at) {
        const createdTime = new Date(doc.created_at).getTime()
        const analyzedTime = new Date(doc.ai_analyzed_at).getTime()
        const timeDiff = analyzedTime - createdTime
        analyzeTimestamps.push(timeDiff)
        stats.timeToAnalyze.min = Math.min(stats.timeToAnalyze.min, timeDiff)
        stats.timeToAnalyze.max = Math.max(stats.timeToAnalyze.max, timeDiff)
      }
    })

    // Calculate averages
    stats.averageConfidence = allDocs.length > 0 ? totalConfidence / allDocs.length : 0
    stats.expirationDateDetection.detectionRate = 
      allDocs.length > 0 
        ? stats.expirationDateDetection.detected / allDocs.length 
        : 0
    stats.timeToAnalyze.average = 
      analyzeTimestamps.length > 0 
        ? analyzeTimestamps.reduce((a, b) => a + b, 0) / analyzeTimestamps.length 
        : 0

    // Calculate accuracy per document type (simulated - based on confidence)
    Object.keys(stats.documentTypes).forEach((type) => {
      const typeDocsConfidence = allDocs
        .filter((d: any) => d.ai_document_type === type)
        .reduce((sum: number, d: any) => sum + (d.ai_confidence || 0), 0)
      
      const typeDocs = allDocs.filter((d: any) => d.ai_document_type === type)
      const avgTypeConfidence = typeDocs.length > 0 ? typeDocsConfidence / typeDocs.length : 0
      stats.documentTypes[type].accuracy = avgTypeConfidence

      // Expiration detection rate for this type
      const typeWithExpiration = typeDocs.filter((d: any) => d.ai_expiration_date).length
      stats.documentTypes[type].expirationDetectionRate = 
        typeDocs.length > 0 ? typeWithExpiration / typeDocs.length : 0
    })

    // Last 5 analyzed documents for reference
    stats.lastAnalyzedDocuments = allDocs
      .sort((a: any, b: any) => 
        new Date(b.ai_analyzed_at).getTime() - new Date(a.ai_analyzed_at).getTime()
      )
      .slice(0, 5)
      .map((doc: any) => ({
        type: doc.ai_document_type,
        confidence: doc.ai_confidence,
        hasExpiration: !!doc.ai_expiration_date,
        analyzedAt: doc.ai_analyzed_at,
      }))

    return NextResponse.json({
      totalDocuments: allDocs.length,
      analyzedDocuments: allDocs.length,
      averageConfidence: stats.averageConfidence,
      accuracyRate: Object.keys(stats.documentTypes).length > 0 
        ? Object.values(stats.documentTypes).reduce((sum: any, t: any) => sum + t.accuracy, 0) / Object.keys(stats.documentTypes).length 
        : 0,
      documentsByType: Object.entries(stats.documentTypes).map(([type, data]: any) => ({
        type,
        count: data.count,
        accuracy: data.accuracy,
      })),
      confidenceDistribution: [
        { range: '90-100%', count: stats.confidenceDistribution.veryHigh },
        { range: '70-90%', count: stats.confidenceDistribution.high },
        { range: '50-70%', count: stats.confidenceDistribution.medium },
        { range: '0-50%', count: stats.confidenceDistribution.low },
      ],
      expirationDateAccuracy: stats.expirationDateDetection.detectionRate,
      trendByDate: stats.lastAnalyzedDocuments.slice(0, 7).map((doc: any) => ({
        date: new Date(doc.analyzedAt).toLocaleDateString(),
        total: 1,
        accurate: doc.confidence > 0.7 ? 1 : 0,
      })),
      recommendations: generateRecommendations(stats),
    })

  } catch (error) {
    console.error('[v0] Document analysis error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error analyzing documents' },
      { status: 500 }
    )
  }
}

/**
 * Generate recommendations for model improvement based on analysis
 */
function generateRecommendations(stats: any): string[] {
  const recommendations: string[] = []

  // Check confidence scores
  const lowConfidenceRatio = 
    (stats.confidenceDistribution.low) / stats.totalAnalyzed
  
  if (lowConfidenceRatio > 0.2) {
    recommendations.push(
      `${Math.round(lowConfidenceRatio * 100)}% of documents have low confidence (<0.5). Consider collecting more training data for improved accuracy.`
    )
  }

  // Check expiration detection
  if (stats.expirationDateDetection.detectionRate < 0.7) {
    recommendations.push(
      `Expiration date detection rate is ${Math.round(stats.expirationDateDetection.detectionRate * 100)}%. Add more examples of documents with expiration dates to training data.`
    )
  }

  // Check document type distribution
  const typeCount = Object.keys(stats.documentTypes).length
  if (typeCount < 5) {
    recommendations.push(
      `Only ${typeCount} document types detected. Ensure diverse document types are being uploaded for comprehensive model training.`
    )
  }

  // Check for poor performing types
  Object.entries(stats.documentTypes).forEach(([type, data]: [string, any]) => {
    if (data.accuracy < 0.6) {
      recommendations.push(
        `Document type "${type}" has low accuracy (${Math.round(data.accuracy * 100)}%). Focus on collecting more training examples for this type.`
      )
    }
  })

  if (recommendations.length === 0) {
    recommendations.push('Model performance is good. Continue monitoring for improvements.')
  }

  return recommendations
}
