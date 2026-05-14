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
    const { action, code, nombre, id } = await request.json()

    if (action === 'add') {
      // Add new document type
      if (!code || !nombre) {
        return NextResponse.json(
          { error: 'Missing required fields: code and nombre' },
          { status: 400 }
        )
      }

      const { data, error } = await supabase
        .from('subcontractor_document_types')
        .insert({ code, nombre })
        .select()
        .single()

      if (error) {
        console.error('Error adding document type:', error)
        return NextResponse.json(
          { error: error.message || 'Failed to add document type' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: `Document type "${nombre}" added successfully`,
        data,
      })
    } else if (action === 'update') {
      // Update existing document type
      if (!id || !code || !nombre) {
        return NextResponse.json(
          { error: 'Missing required fields: id, code, and nombre' },
          { status: 400 }
        )
      }

      const { data, error } = await supabase
        .from('subcontractor_document_types')
        .update({ code, nombre })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating document type:', error)
        return NextResponse.json(
          { error: error.message || 'Failed to update document type' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: `Document type updated successfully`,
        data,
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "add" or "update"' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Error in document-types:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
