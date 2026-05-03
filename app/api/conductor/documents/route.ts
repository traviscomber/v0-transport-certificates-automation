export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    
    // Check if conductor_id cookie exists (set by login)
    const conductorId = cookieStore.get('conductor_id')?.value

    if (!conductorId) {
      return NextResponse.json(
        { message: 'Unauthorized - conductor not authenticated' },
        { status: 401 }
      )
    }

    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { message: 'Server configuration missing' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Query uploaded_documents table for documents belonging to this conductor
    const { data: documents, error } = await supabase
      .from('uploaded_documents')
      .select('*')
      .eq('conductor_id', conductorId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[v0] Error fetching documents:', error)
      return NextResponse.json(
        { message: 'Error fetching documents', error: error.message },
        { status: 500 }
      )
    }

    console.log(`[v0] Found ${documents?.length || 0} documents for conductor ${conductorId}`)

    // Return with success wrapper and normalized fields
    const normalizedDocs = (documents || []).map((doc: any) => ({
      ...doc,
      // Ensure document_type_id is available for matching
      document_type_id: doc.document_type_id || doc.document_type,
    }))

    return NextResponse.json({ success: true, documents: normalizedDocs }, { status: 200 })

  } catch (error) {
    console.error('[v0] Fetch documents error:', error)
    return NextResponse.json(
      { message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
