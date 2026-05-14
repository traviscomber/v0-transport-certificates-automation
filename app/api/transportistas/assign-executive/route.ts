import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Missing Supabase credentials' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { transportista_id, ejecutiva_id } = await request.json()

    if (!transportista_id || !ejecutiva_id) {
      return NextResponse.json(
        { error: 'Missing required fields: transportista_id and ejecutiva_id' },
        { status: 400 }
      )
    }

    // Verify that the executive exists
    const { data: executive, error: execError } = await supabase
      .from('executive_staff')
      .select('id, full_name')
      .eq('id', ejecutiva_id)
      .single()

    if (execError || !executive) {
      return NextResponse.json(
        { error: 'Executive not found' },
        { status: 404 }
      )
    }

    // Update transportista with the assigned executive
    const { data, error } = await supabase
      .from('transportistas')
      .update({ assigned_executive_id: ejecutiva_id })
      .eq('id', transportista_id)
      .select()
      .single()

    if (error) {
      console.error('Error assigning executive:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to assign executive' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Executive ${executive.full_name} assigned successfully`,
      data,
    }, { status: 200 })
  } catch (error: any) {
    console.error('Error in assign-executive:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
