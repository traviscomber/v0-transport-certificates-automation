import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient()

    console.log('[v0] Starting cleanup of driver_documents...')
    
    // Delete all driver documents
    const { error: driverDocsError } = await supabase
      .from('driver_documents')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (driverDocsError) {
      console.error('[v0] Error deleting driver_documents:', driverDocsError)
      return NextResponse.json({ error: driverDocsError.message }, { status: 500 })
    }

    console.log('[v0] Starting cleanup of subcontractor_documents...')

    // Delete all subcontractor documents (if table exists)
    const { error: subDocsError } = await supabase
      .from('subcontractor_documents')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (subDocsError && !subDocsError.message.includes('relation "public.subcontractor_documents" does not exist')) {
      console.error('[v0] Error deleting subcontractor_documents:', subDocsError)
      return NextResponse.json({ error: subDocsError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'All documents cleaned successfully. Database ready for fresh start.'
    })
  } catch (error) {
    console.error('[v0] Cleanup error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
