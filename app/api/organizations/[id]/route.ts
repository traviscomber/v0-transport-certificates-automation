import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

// GET single organization
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ data, success: true })
  } catch (error) {
    console.error('Error fetching organization:', error)
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
  }
}

// PUT update organization
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    const body = await request.json()
    
    const { data, error } = await supabase
      .from('organizations')
      .update({
        name: body.name,
        rut: body.rut,
        type: body.type,
        address: body.address,
        city: body.city,
        region: body.region,
        phone: body.phone,
        email: body.email,
        is_active: body.is_active,
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ data, success: true })
  } catch (error) {
    console.error('Error updating organization:', error)
    return NextResponse.json({ error: 'Failed to update organization' }, { status: 500 })
  }
}

// DELETE organization (soft delete)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    
    const { error } = await supabase
      .from('organizations')
      .update({ is_active: false })
      .eq('id', id)
    
    if (error) throw error
    
    return NextResponse.json({ success: true, message: 'Organization deleted' })
  } catch (error) {
    console.error('Error deleting organization:', error)
    return NextResponse.json({ error: 'Failed to delete organization' }, { status: 500 })
  }
}
