import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()

    // Count total WITHOUT selecting data - this gets true count
    const { count: subTotalCount } = await supabase
      .from('subcontractor_documents')
      .select('*', { count: 'exact', head: true })

    const { count: condTotalCount } = await supabase
      .from('uploaded_documents')
      .select('*', { count: 'exact', head: true })

    // Now get pages of 1000 each to understand the breakdown
    const pages: any[] = []
    let allSubDocs: any[] = []
    
    // Page 0
    const { data: page0 } = await supabase
      .from('subcontractor_documents')
      .select('status')
      .range(0, 999)
    
    // Page 1
    const { data: page1 } = await supabase
      .from('subcontractor_documents')
      .select('status')
      .range(1000, 1999)

    allSubDocs = [...(page0 || []), ...(page1 || [])]

    // Count each status
    const breakdown: Record<string, number> = {}
    allSubDocs.forEach(d => {
      const status = d.status || 'NULL'
      breakdown[status] = (breakdown[status] || 0) + 1
    })

    return NextResponse.json({
      total_count: {
        subcontractor_documents: subTotalCount,
        conductor_documents: condTotalCount
      },
      pages_fetched: {
        page0_records: page0?.length || 0,
        page1_records: page1?.length || 0,
        total_fetched: allSubDocs.length
      },
      breakdown_by_status: breakdown,
      message: subTotalCount && subTotalCount > 1000 ? `WARNING: Total documents (${subTotalCount}) exceeds 1000, need pagination!` : 'All documents fit in single query'
    })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
