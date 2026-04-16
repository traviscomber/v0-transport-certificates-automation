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
