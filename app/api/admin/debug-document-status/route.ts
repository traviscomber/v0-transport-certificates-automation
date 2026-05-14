import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get distinct validation_status values from uploaded_documents
    const { data: statuses, error } = await supabase
      .from('uploaded_documents')
      .select('validation_status')
      .limit(1000)
    
    if (error) throw error
    
    // Get unique values
    const uniqueStatuses = [...new Set(statuses?.map(d => d.validation_status) || [])]
    
    // Count documents by status
    const { data: allDocs } = await supabase
      .from('uploaded_documents')
      .select('validation_status')
    
    const counts: Record<string, number> = {}
    allDocs?.forEach(doc => {
      counts[doc.validation_status] = (counts[doc.validation_status] || 0) + 1
    })
    
    return NextResponse.json({
      uniqueStatuses,
      counts,
      total: allDocs?.length
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
