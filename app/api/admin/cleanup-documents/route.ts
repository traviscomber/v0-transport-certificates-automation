import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireServerActor } from '@/lib/auth/server-actor'

export async function POST(_req: NextRequest) {
  const auth = await requireServerActor(['admin'])
  if (!auth.actor) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const supabase = createAdminClient()

    const { error: driverDocsError } = await supabase
      .from('driver_documents')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (driverDocsError) {
      return NextResponse.json({ error: driverDocsError.message }, { status: 500 })
    }

    const { error: subDocsError } = await supabase
      .from('subcontractor_documents')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (subDocsError && !subDocsError.message.includes('relation "public.subcontractor_documents" does not exist')) {
      return NextResponse.json({ error: subDocsError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'All documents cleaned successfully. Database ready for fresh start.'
    })
  } catch (error) {
    console.error('[admin] Cleanup error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
