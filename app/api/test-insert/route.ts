import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] ==================== TEST INSERT ENDPOINT ====================')
    
    const body = await request.json()
    const { driver_id, file_name, document_type, file_url } = body
    
    console.log('[v0] Test insert data:', { driver_id, file_name, document_type, file_url })

    const adminClient = await createAdminClient()
    
    const docData = {
      driver_id: String(driver_id),
      file_name: file_name || 'test_file.pdf',
      document_type: document_type || 'Test',
      file_url: file_url || 'https://example.com/test.pdf',
      status: 'pendiente'
    }
    
    console.log('[v0] About to INSERT:', docData)

    const { data: insertResult, error: saveError } = await adminClient
      .from('driver_documents')
      .insert([docData])
      .select()

    console.log('[v0] INSERT response - error:', saveError, 'result:', insertResult)

    if (saveError) {
      console.error('[v0] ❌ INSERT FAILED:', {
        code: saveError.code,
        message: saveError.message,
        details: saveError.details,
        hint: saveError.hint
      })
      return NextResponse.json({ 
        error: saveError.message,
        details: saveError.details
      }, { status: 400 })
    }

    console.log('[v0] ✅ INSERT SUCCESS:', insertResult)
    
    return NextResponse.json({
      success: true,
      documents: insertResult || []
    })
  } catch (error) {
    console.error('[v0] EXCEPTION in test insert:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
