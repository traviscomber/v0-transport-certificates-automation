import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

// GET all organizations or filter by type
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    
    let query = supabase
      .from('organizations')
      .select('*')
      .eq('is_active', true)
      .order('name')
    
    if (type) {
      query = query.eq('type', type)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    return NextResponse.json({ data, success: true })
  } catch (error) {
    console.error('Error fetching organizations:', error)
    return NextResponse.json({ error: 'Failed to fetch organizations' }, { status: 500 })
  }
}

// POST create new organization
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { data, error } = await supabase
      .from('organizations')
      .insert({
        name: body.name,
        rut: body.rut,
        type: body.type,
        address: body.address,
        city: body.city,
        region: body.region,
        phone: body.phone,
        email: body.email,
      })
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ data, success: true }, { status: 201 })
  } catch (error) {
    console.error('Error creating organization:', error)
    return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 })
  }
}
