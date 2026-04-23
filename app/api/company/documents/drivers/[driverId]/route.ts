import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface RouteParams {
  params: {
    driverId: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const adminClient = createAdminClient()

    const { data: documents, error } = await adminClient
      .from('documents')
      .select('*')
      .eq('driver_id', params.driverId)
      .order('upload_date', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(documents || [])
  } catch (error) {
    console.error('[v0] Error fetching driver documents:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error fetching documents' },
      { status: 500 }
    )
  }
}
