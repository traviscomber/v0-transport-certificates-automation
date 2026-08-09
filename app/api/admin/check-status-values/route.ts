import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireServerActor } from '@/lib/auth/server-actor'

export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await requireServerActor(['admin'])
  if (!auth.actor) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const adminClient = createAdminClient()

    const { data: subStatuses } = await adminClient
      .from('subcontractor_documents')
      .select('status')

    const subStatusCounts: Record<string, number> = {}
    subStatuses?.forEach((doc) => {
      const status = doc.status || 'NULL'
      subStatusCounts[status] = (subStatusCounts[status] || 0) + 1
    })

    const { data: conductorStatuses } = await adminClient
      .from('uploaded_documents')
      .select('validation_status')

    const conductorStatusCounts: Record<string, number> = {}
    conductorStatuses?.forEach((doc) => {
      const status = doc.validation_status || 'NULL'
      conductorStatusCounts[status] = (conductorStatusCounts[status] || 0) + 1
    })

    return NextResponse.json({
      subcontractor_documents: {
        distinct_statuses: subStatusCounts,
        total: subStatuses?.length || 0,
      },
      uploaded_documents: {
        distinct_statuses: conductorStatusCounts,
        total: conductorStatuses?.length || 0,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
