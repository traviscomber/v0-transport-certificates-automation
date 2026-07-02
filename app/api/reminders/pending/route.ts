import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!url || !key) {
    throw new Error('Missing Supabase credentials')
  }
  
  return createClient(url, key)
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7')

    // Get documents with pending status created more than X days ago
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    const { data: pendingDocs, error } = await supabase
      .from('subcontractor_documents')
      .select(`
        id,
        subcontractor_id,
        document_type_id,
        status,
        created_at,
        subcontractor_document_types(code),
        subcontratistas(nombre_fantasia, razon_social, telefono_whatsapp)
      `)
      .eq('status', 'pending')
      .lt('created_at', cutoffDate.toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Group by subcontractor and count documents
    const grouped = new Map<string, {
      subcontractor_id: string
      subcontractor_name: string
      subcontractor_phone: string
      documents: typeof pendingDocs
      count: number
      days_pending: number
      type_codes: Set<string>
    }>()

    ;(pendingDocs as any[]).forEach((doc: any) => {
      const name = doc.subcontratistas?.nombre_fantasia || doc.subcontratistas?.razon_social || 'Sin nombre'
      const phone = doc.subcontratistas?.telefono_whatsapp || '+56'
      const typeCode = doc.subcontractor_document_types?.code || 'UNKNOWN'
      const daysPending = Math.floor((Date.now() - new Date(doc.created_at).getTime()) / (1000 * 60 * 60 * 24))

      if (!grouped.has(doc.subcontractor_id)) {
        grouped.set(doc.subcontractor_id, {
          subcontractor_id: doc.subcontractor_id,
          subcontractor_name: name,
          subcontractor_phone: phone,
          documents: [],
          count: 0,
          days_pending: daysPending,
          type_codes: new Set(),
        })
      }

      const group = grouped.get(doc.subcontractor_id)!
      group.documents.push(doc)
      group.count++
      group.type_codes.add(typeCode)
      group.days_pending = Math.max(group.days_pending, daysPending)
    })

    // Convert to array
    const result = Array.from(grouped.values()).map(g => ({
      id: g.subcontractor_id,
      subcontractor_id: g.subcontractor_id,
      subcontractor_name: g.subcontractor_name,
      subcontractor_phone: g.subcontractor_phone,
      document_type: Array.from(g.type_codes).join(', '),
      days_pending: g.days_pending,
      count: g.count,
      created_at: g.documents[0].created_at,
      status: 'pending',
    }))

    return NextResponse.json({ pending: result, count: result.length })
  } catch (error) {
    console.error('Error fetching pending documents:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    )
  }
}
