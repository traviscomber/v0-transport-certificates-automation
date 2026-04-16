import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const driverId = params.id

    if (!driverId) {
      return NextResponse.json({ error: 'Driver ID is required' }, { status: 400 })
    }

    // Crear cliente de Supabase del servidor
    const supabase = await createServerClient()

    // Obtener documentos del conductor
    const { data, error } = await supabase
      .from('driver_documents')
      .select('id, driver_id, document_type as tipo, file_name as nombre, status as estado, uploaded_at as fecha_subida')
      .eq('driver_id', driverId)
      .order('uploaded_at', { ascending: false })

    if (error) {
      console.error('[v0] Error fetching documents:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log('[v0] Documents fetched for driver', driverId, ':', data?.length || 0)
    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error('[v0] Error in fetch handler:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}
