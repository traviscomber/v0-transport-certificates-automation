import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: Request, { params }: { params: { driverId: string } }) {
  try {
    const driverId = params.driverId

    // Obtener documentos del conductor
    const { data, error } = await supabase
      .from('driver_documents')
      .select('id, driver_id, document_type as tipo, file_name as nombre, status as estado, uploaded_at as fecha_subida')
      .eq('driver_id', driverId)
      .order('uploaded_at', { ascending: false })

    if (error) {
      console.error('[v0] Error fetching documents:', error)
      return Response.json({ error: error.message }, { status: 400 })
    }

    console.log('[v0] Documents fetched:', data)
    return Response.json({ data }, { status: 200 })
  } catch (error) {
    console.error('[v0] Error in fetch handler:', error)
    return Response.json({ error: 'Failed to fetch documents' }, { status: 500 })
  }
}
