import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile?.organization_id) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 })
    }

    // Count documents by status - real documents from uploaded_documents table
    const { data, error } = await supabase
      .from('uploaded_documents')
      .select('validation_status', { count: 'exact' })

    if (error) {
      console.error('[v0] Error fetching document counts:', error)
      return NextResponse.json({ error: 'Failed to fetch document counts' }, { status: 500 })
    }

    // Calculate counts by status
    const documents = data || []
    const counts = {
      total: documents.length,
      approved: documents.filter((d: any) => d.validation_status === 'approved').length,
      rejected: documents.filter((d: any) => d.validation_status === 'rejected').length,
      pending: documents.filter((d: any) => d.validation_status === 'pending').length,
    }

    return NextResponse.json(counts)
  } catch (error) {
    console.error('[v0] Error in documents count route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
