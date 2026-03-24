import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

// GET single driver
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    
    const { data, error } = await supabase
      .from('drivers')
      .select(`
        *,
        organization:organizations(id, name),
        certificates:certificates(id, document_type_id, status, expiry_date)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ data, success: true })
  } catch (error) {
    console.error('Error fetching driver:', error)
    return NextResponse.json({ error: 'Driver not found' }, { status: 404 })
  }
}

// PUT update driver
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    const body = await request.json()
    
    const { data, error } = await supabase
      .from('drivers')
      .update({
        full_name: body.full_name,
        rut: body.rut,
        email: body.email,
        phone: body.phone,
        license_number: body.license_number,
        license_type: body.license_type,
        license_expiry: body.license_expiry,
        is_active: body.is_active,
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ data, success: true })
  } catch (error) {
    console.error('Error updating driver:', error)
    return NextResponse.json({ error: 'Failed to update driver' }, { status: 500 })
  }
}

// DELETE driver (soft delete)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    
    const { error } = await supabase
      .from('drivers')
      .update({ is_active: false })
      .eq('id', id)
    
    if (error) throw error
    
    return NextResponse.json({ success: true, message: 'Driver deleted' })
  } catch (error) {
    console.error('Error deleting driver:', error)
    return NextResponse.json({ error: 'Failed to delete driver' }, { status: 500 })
  }
}
