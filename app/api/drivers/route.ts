import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

// GET all drivers
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organization_id')
    
    let query = supabase
      .from('drivers')
      .select(`
        *,
        organization:organizations(id, name),
        assignments:driver_assignments(
          vehicle:vehicles(id, plate, brand, model)
        )
      `)
      .eq('is_active', true)
      .order('full_name')
    
    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    return NextResponse.json({ data, success: true })
  } catch (error) {
    console.error('Error fetching drivers:', error)
    return NextResponse.json({ error: 'Failed to fetch drivers' }, { status: 500 })
  }
}

// POST create new driver
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { data, error } = await supabase
      .from('drivers')
      .insert({
        organization_id: body.organization_id,
        full_name: body.full_name,
        rut: body.rut,
        email: body.email,
        phone: body.phone,
        license_number: body.license_number,
        license_type: body.license_type,
        license_expiry: body.license_expiry,
      })
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ data, success: true }, { status: 201 })
  } catch (error) {
    console.error('Error creating driver:', error)
    return NextResponse.json({ error: 'Failed to create driver' }, { status: 500 })
  }
}
