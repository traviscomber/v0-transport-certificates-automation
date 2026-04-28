import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get raw documents count
    const { count: totalCount } = await (supabase as any)
      .from('uploaded_documents')
      .select('*', { count: 'exact', head: true })

    // Get documents with validated_at
    const { data: validatedDocs, count: validatedCount } = await (supabase as any)
      .from('uploaded_documents')
      .select('id, validated_by, validated_at, validation_status, created_at', { count: 'exact' })
      .not('validated_at', 'is', null)
      .limit(100)

    // Get unique validated_by values
    const validatedByIds = [...new Set((validatedDocs || []).map((d: any) => d.validated_by).filter(Boolean))]

    // Get profiles for those IDs
    let profiles = []
    if (validatedByIds.length > 0) {
      const { data: profileData } = await (supabase as any)
        .from('profiles')
        .select('id, full_name')
        .in('id', validatedByIds)
      profiles = profileData || []
    }

    return NextResponse.json({
      debug: {
        total_documents_count: totalCount,
        validated_documents_count: validatedCount,
        validated_documents_sample: validatedDocs?.slice(0, 5),
        unique_validated_by_ids: validatedByIds,
        profiles_found: profiles,
      }
    })
  } catch (error) {
    console.error('[v0] Debug endpoint error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
