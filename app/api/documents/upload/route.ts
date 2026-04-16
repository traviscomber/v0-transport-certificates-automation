import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    const { driverId, tipo, nombre } = await request.json()

    if (!driverId || !tipo || !nombre) {
      return NextResponse.json(
        { error: 'Missing required fields: driverId, tipo, nombre' },
        { status: 400 }
      )
    }

    // Insertar documento en Supabase
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
      console.error('[v0] Supabase error inserting document:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to insert document' },
        { status: 400 }
      )
    }

    console.log('[v0] Document uploaded successfully:', data)
    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    console.error('[v0] Error in upload handler:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload document' },
      { status: 500 }
    )
  }
}
