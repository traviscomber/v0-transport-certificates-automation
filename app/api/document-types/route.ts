import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

// GET all document types
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const mandatory = searchParams.get('mandatory')
    
    let query = supabase
      .from('document_types')
      .select('*')
      .eq('is_active', true)
      .order('category')
      .order('name')
    
    if (category) {
      query = query.eq('category', category)
    }
    
    if (mandatory === 'true') {
      query = query.eq('is_mandatory', true)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    return NextResponse.json({ data, success: true })
  } catch (error) {
    console.error('Error fetching document types:', error)
    return NextResponse.json({ error: 'Failed to fetch document types' }, { status: 500 })
  }
}

// POST create new document type (admin only)
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { data, error } = await supabase
      .from('document_types')
      .insert({
        code: body.code,
        name: body.name,
        description: body.description,
        category: body.category,
        is_mandatory: body.is_mandatory ?? true,
        validity_days: body.validity_days,
        required_fields: body.required_fields ?? [],
      })
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ data, success: true }, { status: 201 })
  } catch (error) {
    console.error('Error creating document type:', error)
    return NextResponse.json({ error: 'Failed to create document type' }, { status: 500 })
  }
}
