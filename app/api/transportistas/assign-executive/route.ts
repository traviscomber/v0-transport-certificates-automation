import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { transportista_id, ejecutiva_id } = await request.json()

    if (!transportista_id || !ejecutiva_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if executive-company relationship already exists
    const { data: existing } = await supabase
      .from('executive_staff')
      .select('*')
      .eq('transportista_id', transportista_id)
      .eq('ejecutiva_id', ejecutiva_id)
      .single()

    if (existing) {
      return NextResponse.json(
        { message: 'Executive already assigned to this company' },
        { status: 200 }
      )
    }

    // Assign executive to company
    const { data, error } = await supabase
      .from('executive_staff')
      .insert({
        transportista_id,
        ejecutiva_id,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error assigning executive:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Error in assign-executive:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
