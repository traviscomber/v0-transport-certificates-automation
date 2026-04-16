import { type NextRequest, NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const driverId = params.id

    if (!driverId) {
      return NextResponse.json({ error: 'Driver ID is required' }, { status: 400 })
    }

    // Crear cliente de Supabase con ANON_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !anonKey) {
      console.error('[v0] Missing Supabase configuration')
      return NextResponse.json(
        { error: 'Server not properly configured' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Obtener documentos del conductor desde tabla monthly_documents
    const { data, error } = await supabase
      .from('monthly_documents')
      .select('id, file_name as nombre, document_type as tipo, status as estado, uploaded_at as fecha_subida, month_year')
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
