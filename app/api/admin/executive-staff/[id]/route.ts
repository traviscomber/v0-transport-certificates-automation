import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * PUT /api/admin/executive-staff/[id]
 * Update an executive
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
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
    const { id } = params
    const body = await request.json()
    const { nombre, apellido } = body

    if (!nombre) {
      return NextResponse.json(
        { error: 'Nombre is required' },
        { status: 400 }
      )
    }

    // Update executive
    const { data, error } = await supabase
      .from('executive_staff')
      .update({
        nombre,
        apellido,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()

    if (error) {
      console.error('[v0] Error updating executive:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Executive not found' },
        { status: 404 }
      )
    }

    console.log('[v0] Updated executive:', id)
    return NextResponse.json({ executive: data[0], message: 'Executive updated' })
  } catch (error) {
    console.error('[v0] Error updating executive:', error)
    return NextResponse.json(
      { error: 'Failed to update executive' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/executive-staff/[id]
 * Soft delete (deactivate) an executive
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'Missing executive ID' },
        { status: 400 }
      )
    }

    // Soft delete by marking as inactive
    const { data, error } = await supabase
      .from('executive_staff')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()

    if (error) {
      console.error('[v0] Error deleting executive:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Executive not found' },
        { status: 404 }
      )
    }

    console.log('[v0] Deleted executive:', id)
    return NextResponse.json({ message: 'Executive deleted' })
  } catch (error) {
    console.error('[v0] Error deleting executive:', error)
    return NextResponse.json(
      { error: 'Failed to delete executive' },
      { status: 500 }
    )
  }
}
