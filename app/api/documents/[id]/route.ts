import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const driverId = params.id

    // Obtener documentos del conductor
    const { data, error } = await supabaseAdmin
      .from('driver_documents')
      .select('id, driver_id, document_type as tipo, file_name as nombre, status as estado, uploaded_at as fecha_subida')
      .eq('driver_id', driverId)
      .order('uploaded_at', { ascending: false })

    if (error) {
      console.error('[v0] Error fetching documents:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (process.env.NODE_ENV === 'development') console.log('[v0] Documents fetched:', data)
    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error('[v0] Error in fetch handler:', error)
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createServerClient()
    const { id } = params
    const body = await request.json()

    if (process.env.NODE_ENV === 'development') console.log("[v0] Updating document:", id, body)

    const { data, error } = await supabase
      .from("transporters")
      .update({
        name: body.name,
        rut: body.rut,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()

    if (error) {
      console.error("[v0] Supabase update error:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    if (process.env.NODE_ENV === 'development') console.log("[v0] Document updated successfully:", data)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[v0] Update document error:", error)
    return NextResponse.json({ success: false, error: "Failed to update document" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createServerClient()
    const { id } = params

    if (process.env.NODE_ENV === 'development') console.log("[v0] Deleting document:", id)

    const { error } = await supabase.from("transporters").delete().eq("id", id)

    if (error) {
      console.error("[v0] Supabase delete error:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    if (process.env.NODE_ENV === 'development') console.log("[v0] Document deleted successfully")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Delete document error:", error)
    return NextResponse.json({ success: false, error: "Failed to delete document" }, { status: 500 })
  }
}
