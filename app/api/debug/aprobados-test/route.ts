export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabase = createAdminClient()

    console.log('[v0] DEBUG: Testing approved documents endpoint')

    // Get just first 5 approved conductor docs
    const { data: conductorDocs, error: conductorError } = await supabase
      .from('uploaded_documents')
      .select('id, validation_status, created_at, updated_at')
      .eq('validation_status', 'approved')
      .limit(5)

    console.log('[v0] DEBUG: Conductor docs query error:', conductorError?.message || 'none')
    console.log('[v0] DEBUG: Conductor docs found:', conductorDocs?.length || 0)
    console.log('[v0] DEBUG: Sample conductor docs:', conductorDocs)

    if (conductorDocs && conductorDocs.length > 0) {
      const docIds = conductorDocs.map(d => d.id)
      console.log('[v0] DEBUG: Doc IDs:', docIds)

      // Query ALL audit logs for these docs (no filter)
      const { data: allAuditLogs, error: auditError1 } = await supabase
        .from('document_status_audit_log')
        .select('*')
        .in('document_id', docIds)

      console.log('[v0] DEBUG: Audit log query (all) error:', auditError1?.message || 'none')
      console.log('[v0] DEBUG: Total audit logs found:', allAuditLogs?.length || 0)
      if (allAuditLogs && allAuditLogs.length > 0) {
        console.log('[v0] DEBUG: Sample audit logs:', allAuditLogs.slice(0, 3))
        console.log('[v0] DEBUG: Unique new_status values:', [...new Set(allAuditLogs.map(l => l.new_status))])
        
        const approvedLogs = allAuditLogs.filter(l => l.new_status === 'approved')
        console.log('[v0] DEBUG: Logs with new_status=approved:', approvedLogs.length)
        
        if (approvedLogs.length > 0) {
          console.log('[v0] DEBUG: First approved log:', approvedLogs[0])
        }
      }

      return NextResponse.json({
        conductorDocs,
        totalAuditLogs: allAuditLogs?.length || 0,
        approvedLogs: allAuditLogs?.filter((l: any) => l.new_status === 'approved').length || 0,
        sampleAuditLogs: allAuditLogs?.slice(0, 3) || [],
        allAuditLogs: allAuditLogs || []
      })
    }

    return NextResponse.json({
      error: 'No approved documents found',
      conductorDocs
    })

  } catch (error) {
    console.error('[v0] DEBUG: Error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
