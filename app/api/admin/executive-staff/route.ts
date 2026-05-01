import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
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
    const { searchParams } = new URL(request.url)
    const transportistaId = searchParams.get('transportista_id')

    let query = supabase
      .from('executive_staff')
      .select('*')
      .eq('is_active', true)

    if (transportistaId) {
      query = query.eq('transportista_id', transportistaId)
    }

    const { data, error } = await query.order('cargo', { ascending: true })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ executives: data || [] })
  } catch (error) {
    console.error('[v0] Error fetching executives:', error)
    return NextResponse.json(
      { error: 'Failed to fetch executives' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      transportista_id,
      nombre_completo,
      rut,
      cargo,
      telefono,
      email,
      direccion
    } = body

    const { data, error } = await supabase
      .from('executive_staff')
      .insert([{
        transportista_id,
        nombre_completo,
        rut,
        cargo,
        telefono,
        email,
        direccion,
        is_active: true
      }])
      .select()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ executive: data?.[0] }, { status: 201 })
  } catch (error) {
    console.error('[v0] Error creating executive:', error)
    return NextResponse.json(
      { error: 'Failed to create executive' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    const { data, error } = await supabase
      .from('executive_staff')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ executive: data?.[0] })
  } catch (error) {
    console.error('[v0] Error updating executive:', error)
    return NextResponse.json(
      { error: 'Failed to update executive' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Missing executive ID' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('executive_staff')
      .update({ is_active: false })
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error deleting executive:', error)
    return NextResponse.json(
      { error: 'Failed to delete executive' },
      { status: 500 }
    )
  }
}
