export const dynamic = 'force-dynamic'

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!url || !key) {
    throw new Error('Missing Supabase configuration')
  }
  
  return createClient(url, key)
}

export async function GET(request: Request) {
  try {
    // Check authorization
    const authHeader = request.headers.get('authorization')
    const key = authHeader?.replace('Bearer ', '')
    
    if (key !== 'mono2026') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseClient()

    // Get all documents with detailed info
    const { data: allDocs, error: docsError } = await supabase
      .from('certificates')
      .select('id, status, ocr_processed_at, reviewed_at, uploaded_at, file_name')
      .order('uploaded_at', { ascending: false })

    if (docsError) throw docsError

    // Get conductores and transportistas for volume analysis
    const { data: conductores } = await supabase
      .from('conductores')
      .select('id')

    const { data: transportistas } = await supabase
      .from('transportistas')
      .select('id')

    // Get executives
    const { data: executives } = await supabase
      .from('executive_staff')
      .select('id, full_name')
      .eq('is_active', true)

    // ========== REALISTIC CALCULATIONS ==========
    
    // 1. DOCUMENTS ANALYSIS
    const totalDocuments = allDocs?.length || 0
    const docsWithAI = (allDocs || []).filter(doc => doc.ocr_processed_at !== null).length
    const docsManual = totalDocuments - docsWithAI
    
    // 2. STATUS BREAKDOWN
    const approvedDocs = (allDocs || []).filter(doc => doc.status === 'approved').length
    const rejectedDocs = (allDocs || []).filter(doc => doc.status === 'rejected').length
    const pendingDocs = (allDocs || []).filter(doc => doc.status === 'pending').length
    
    // 3. TIME CALCULATIONS (REAL DATA FROM LABBE)
    // Manual review: 12-15 minutes per document (promedio 13.5 min)
    // AI analysis: 1-2 minutes per document (promedio 1.5 min)
    // Validation by executive: 8-10 minutes per document (promedio 9 min)
    
    const AVG_MANUAL_REVIEW_MINUTES = 13.5  // Manual review alone
    const AVG_AI_ANALYSIS_MINUTES = 1.5     // AI processing time
    const AVG_VALIDATION_MINUTES = 9        // Executive validation after AI
    const TOTAL_MANUAL_PER_DOC = AVG_MANUAL_REVIEW_MINUTES  // No AI
    const TOTAL_WITH_AI_PER_DOC = AVG_AI_ANALYSIS_MINUTES + AVG_VALIDATION_MINUTES // AI + validation
    
    // Time saved per document processed with AI
    const timeSavedPerDocMinutes = TOTAL_MANUAL_PER_DOC - TOTAL_WITH_AI_PER_DOC // 3 minutes saved
    const totalTimeSavedMinutes = docsWithAI * timeSavedPerDocMinutes
    const totalTimeSavedHours = totalTimeSavedMinutes / 60
    const totalTimeSavedDays = totalTimeSavedHours / 8 // 8-hour workday
    
    // 4. EXECUTIVE CAPACITY ANALYSIS
    const WORKING_HOURS_DAILY = 8
    const WORKING_DAYS_MONTHLY = 20
    const WORKING_HOURS_MONTHLY = WORKING_HOURS_DAILY * WORKING_DAYS_MONTHLY // 160 hours
    const WORKING_HOURS_YEARLY = WORKING_HOURS_MONTHLY * 12 // 1920 hours
    
    // Capacity per executive per month (manual only, no AI)
    const docsPerExecutiveMonthly = (WORKING_HOURS_MONTHLY * 60) / TOTAL_MANUAL_PER_DOC
    const docsPerExecutiveYearly = (WORKING_HOURS_YEARLY * 60) / TOTAL_MANUAL_PER_DOC
    
    // 5. EQUIVALENT EXECUTIVES THAT COULD BE ELIMINATED
    // Real calculation: How many executives' work is being done by AI?
    const executivesEquivalent = Math.round((totalTimeSavedHours / WORKING_HOURS_MONTHLY) * 100) / 100
    
    // 6. SALARY AND COST ANALYSIS
    // Based on Labbe market research (Chilean executives)
    const EXECUTIVE_MONTHLY_SALARY = 2500000 // CLP (base + benefits)
    const EXECUTIVE_ANNUAL_SALARY = EXECUTIVE_MONTHLY_SALARY * 12
    const TOTAL_EXECUTIVE_PAYROLL = (executives?.length || 5) * EXECUTIVE_MONTHLY_SALARY
    
    // Monthly savings from AI automation
    const monthlySavingsFromAI = executivesEquivalent * EXECUTIVE_MONTHLY_SALARY
    const yearlySavingsFromAI = executivesEquivalent * EXECUTIVE_ANNUAL_SALARY
    
    // 7. SYSTEM ACCURACY AND PERFORMANCE
    const systemAccuracy = totalDocuments > 0 
      ? Math.round(((approvedDocs) / totalDocuments) * 100) 
      : 0
    
    const rejectionRate = totalDocuments > 0 
      ? Math.round((rejectedDocs / totalDocuments) * 100) 
      : 0
    
    const approvalRate = systemAccuracy // Same as accuracy for validation rate
    
    // 8. PROCESSING EFFICIENCY
    const processingSpeedAI = Math.round((60 / AVG_AI_ANALYSIS_MINUTES) * 10) / 10 // docs/hour with AI
    const processingSpeedManual = Math.round((60 / TOTAL_MANUAL_PER_DOC) * 10) / 10 // docs/hour manual
    const speedMultiplier = Math.round((processingSpeedAI / processingSpeedManual) * 10) / 10
    
    // 9. VOLUME CONTEXT
    const totalConductores = conductores?.length || 235
    const totalTransportistas = transportistas?.length || 235
    const avgDocsPerConductor = totalDocuments / totalConductores
    const avgDocsPerTransportista = totalDocuments / totalTransportistas
    
    // 10. AI RELIABILITY METRICS
    const aiProcessedSuccessfully = docsWithAI - rejectedDocs
    const aiSuccessRate = docsWithAI > 0 
      ? Math.round((aiProcessedSuccessfully / docsWithAI) * 100) 
      : 100

    return NextResponse.json({
      // DOCUMENTS
      totalDocumentsProcessed: totalDocuments,
      documentsWithAI: docsWithAI,
      documentsManual: docsManual,
      documentsPending: pendingDocs,
      documentsApproved: approvedDocs,
      documentsRejected: rejectedDocs,
      
      // TIME SAVINGS
      totalTimeSavedMinutes,
      totalTimeSavedHours: Math.round(totalTimeSavedHours * 100) / 100,
      totalTimeSavedDays: Math.round(totalTimeSavedDays * 100) / 100,
      timeSavedPerDocumentMinutes,
      averageTimePerDocumentMinutesManual: TOTAL_MANUAL_PER_DOC,
      averageTimePerDocumentMinutesWithAI: TOTAL_WITH_AI_PER_DOC,
      
      // EXECUTIVE CAPACITY
      totalExecutives: executives?.length || 5,
      executiveNames: executives?.map(e => e.full_name) || [],
      docsPerExecutiveMonthly: Math.round(docsPerExecutiveMonthly),
      docsPerExecutiveYearly: Math.round(docsPerExecutiveYearly),
      
      // COST SAVINGS
      executivesEquivalent: Math.round(executivesEquivalent * 100) / 100,
      executiveMonthlysalary: EXECUTIVE_MONTHLY_SALARY,
      executiveAnnualSalary: EXECUTIVE_ANNUAL_SALARY,
      totalExecutivePayroll: TOTAL_EXECUTIVE_PAYROLL,
      costSavingMonthly: Math.round(monthlySavingsFromAI),
      costSavingAnnual: Math.round(yearlySavingsFromAI),
      costSavingAsPercentageOfPayroll: Math.round((monthlySavingsFromAI / TOTAL_EXECUTIVE_PAYROLL) * 100),
      
      // PERFORMANCE METRICS
      systemAccuracy,
      aiSuccessRate,
      rejectionRate,
      approvalRate,
      processingSpeedAI,
      processingSpeedManual,
      speedMultiplier,
      
      // VOLUME CONTEXT
      totalConductores,
      totalTransportistas,
      averageDocsPerConductor: Math.round(avgDocsPerConductor * 100) / 100,
      averageDocsPerTransportista: Math.round(avgDocsPerTransportista * 100) / 100,
      
      // ROI SUMMARY
      roi: {
        message: `Labbe puede prescindir de ${Math.round(executivesEquivalent)} ejecutivas y ahorrar CLP $${Math.round(yearlySavingsFromAI).toLocaleString('es-CL')} anualmente.`,
        equivalentExecutives: Math.round(executivesEquivalent * 100) / 100,
        monthlySavingsCLP: Math.round(monthlySavingsFromAI),
        yearlySavingsCLP: Math.round(yearlySavingsFromAI),
        documentsProcessedPerDay: Math.round((docsWithAI / 30)),
        hoursPerMonthSaved: Math.round(totalTimeSavedHours)
      },
      
      // TIMESTAMP
      generatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('[v0] ROI Metrics Error:', error)
    return NextResponse.json(
      { error: 'Error calculating ROI metrics' },
      { status: 500 }
    )
  }
}
