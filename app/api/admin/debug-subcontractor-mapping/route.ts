import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function GET() {
  try {
    // Get first subcontractor document
    const { data: subDoc } = await supabase
      .from('subcontractor_documents')
      .select('id, subcontractor_id')
      .eq('status', 'approved')
      .limit(1)

    if (!subDoc || subDoc.length === 0) {
      return NextResponse.json({ error: 'No approved subcontractor documents found' })
    }

    const sub = subDoc[0] as any
    console.log('[v0] Debug: subcontractor_documents.subcontractor_id =', sub.subcontractor_id)

    // Try to find matching transportista by that ID
    const { data: transportista1 } = await supabase
      .from('transportistas')
      .select('id, rut, razon_social, assigned_executive_id')
      .eq('id', sub.subcontractor_id)

    console.log('[v0] Debug: transportista by ID:', transportista1)

    // Also get all transportistas to see what IDs exist
    const { data: allTransportistas } = await supabase
      .from('transportistas')
      .select('id, rut, razon_social')
      .limit(5)

    console.log('[v0] Debug: All transportistas sample:', allTransportistas)

    // Check subcontractor_documents table structure
    const { data: subDocSample } = await supabase
      .from('subcontractor_documents')
      .select('id, subcontractor_id, subcontractor_rut')
      .eq('status', 'approved')
      .limit(3)

    console.log('[v0] Debug: subcontractor_documents sample:', subDocSample)

    return NextResponse.json({
      subDoc: sub,
      transportista: transportista1,
      subDocSample,
      allTransportistas
    })
  } catch (error) {
    console.error('[v0] Debug error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
