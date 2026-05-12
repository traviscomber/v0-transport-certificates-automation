import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()

    // Get all records from transportista_auth
    const { data: allRecords, error: allError } = await supabase
      .from('transportista_auth')
      .select('*')
      .limit(10)

    if (allError) {
      return NextResponse.json(
        { error: 'Error fetching records', details: allError.message },
        { status: 500 }
      )
    }

    // Specifically search for the test RUT
    const { data: testRecord, error: testError } = await supabase
      .from('transportista_auth')
      .select('*')
      .eq('rut', '77653071-9')
      .single()

    // Get count of all records
    const { count, error: countError } = await supabase
      .from('transportista_auth')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      success: true,
      totalRecords: count,
      testRutFound: !testError && testRecord,
      testRecord: testRecord || null,
      testError: testError?.message || null,
      sampleRecords: allRecords || [],
    })

  } catch (error) {
    return NextResponse.json(
      {
        error: 'Debug error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
