'use server'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get all pending documents across all transportistas
    const { data: documents, error } = await supabase
      .from('certificates')
      .select(`
        id,
        conductor_id,
        document_type,
        status,
        created_at,
        file_url
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    // Get conductor information for each document
    const conductorIds = [...new Set(documents?.map((doc: any) => doc.conductor_id) || [])]
    
    let conductorMap: Record<string, string> = {}
    if (conductorIds.length > 0) {
      const { data: conductors } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', conductorIds)
      
      conductors?.forEach((conductor: any) => {
        conductorMap[conductor.id] = conductor.full_name
      })
    }

    // Format response
    const formatted = documents?.map((doc: any) => ({
      id: doc.id,
      conductor_name: conductorMap[doc.conductor_id] || 'Desconocido',
      document_type: doc.document_type,
      status: doc.status,
      created_at: doc.created_at,
      file_url: doc.file_url,
    })) || []

    return NextResponse.json(formatted, { status: 200 })
  } catch (error) {
    console.error('Error fetching pending documents:', error)
    return NextResponse.json(
      { error: 'Error al obtener documentos pendientes' },
      { status: 500 }
    )
  }
}
