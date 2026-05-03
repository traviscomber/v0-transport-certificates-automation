import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { validation_status } = await request.json()

    if (!['approved', 'rejected', 'pending'].includes(validation_status)) {
      return NextResponse.json(
        { message: 'Invalid validation status' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('uploaded_documents')
      .update({ validation_status })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { message: 'Failed to update document status' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, document: data }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
