import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: Request) {
  try {
    const { driverId, tipo, nombre } = await request.json()

    // Insertar documento
    const { data, error } = await supabase
      .from('driver_documents')
      .insert([
        {
          driver_id: driverId,
          document_type: tipo,
          file_name: nombre,
          file_url: `/documents/${driverId}/${nombre}`,
          status: 'pendiente',
          uploaded_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      console.error('[v0] Error inserting document:', error)
      return Response.json({ error: error.message }, { status: 400 })
    }

    console.log('[v0] Document uploaded successfully:', data)
    return Response.json({ success: true, data }, { status: 201 })
  } catch (error) {
    console.error('[v0] Error in upload handler:', error)
    return Response.json({ error: 'Failed to upload document' }, { status: 500 })
  }
}
