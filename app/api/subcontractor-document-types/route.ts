import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabase = createAdminClient()
    
    // Inactive document types (deprecated/removed from system)
    const inactiveTypes = ['AFP', 'SALUD', 'MUTUAL', 'SEGURO_SOCIAL']

    const { data: documentTypes, error } = await supabase
      .from('subcontractor_document_types')
      .select('id, code, nombre, periodicidad, es_obligatorio')
      .notIn('code', inactiveTypes)
      .order('nombre', { ascending: true })

    if (error) {
      console.error('[v0] Error fetching document types:', error)
      return NextResponse.json(
        { error: 'Error al obtener tipos de documentos' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      documentTypes: documentTypes || [],
    })

  } catch (error) {
    console.error('[v0] Error in document types endpoint:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
