import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { validateLicensePlate } from "@/lib/chilean-validators"

export const dynamic = 'force-dynamic'

// GET all vehicles
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organization_id')
    
    let query = supabase
      .from('vehicles')
      .select(`
        *,
        organization:organizations(id, name)
      `)
      .eq('is_active', true)
      .order('plate')
    
    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    return NextResponse.json({ data, success: true })
  } catch (error) {
    console.error('Error fetching vehicles:', error)
    return NextResponse.json({ error: 'Failed to fetch vehicles' }, { status: 500 })
  }
}

// POST create new vehicle with validation
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.organization_id) return NextResponse.json({ error: 'organization_id es requerido' }, { status: 400 })
    if (!body.plate) return NextResponse.json({ error: 'plate es requerido' }, { status: 400 })
    
    // Validate plate format
    const plateValidation = validateLicensePlate(body.plate)
    if (!plateValidation.valid) return NextResponse.json({ error: plateValidation.error }, { status: 400 })
    
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('vehicles')
      .insert({
        organization_id: body.organization_id,
        plate: body.plate,
        brand: body.brand,
        model: body.model,
        year: body.year,
        type: body.type,
        vin: body.vin,
      })
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ data, success: true }, { status: 201 })
  } catch (error) {
    console.error('Error creating vehicle:', error)
    return NextResponse.json({ error: 'Failed to create vehicle' }, { status: 500 })
  }
}
