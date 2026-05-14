import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Missing Supabase credentials' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Update F23 to F29
    const { data: f29Data, error: f29Error } = await supabase
      .from('subcontractor_document_types')
      .update({ 
        code: 'F29', 
        nombre: 'Formulario F29',
        descripcion: 'Declaración de impuesto a la renta'
      })
      .eq('code', 'F23')
      .select()

    // Add new document type: Certificado de Afiliaciones
    const { data: certData, error: certError } = await supabase
      .from('subcontractor_document_types')
      .insert({
        code: 'CERT_AFILIACIONES',
        nombre: 'Certificado de Afiliaciones',
        descripcion: 'Certificado de afiliaciones a organismos',
        periodicidad: 'Trimestral',
        es_obligatorio: true
      })
      .select()

    if (f29Error && !f29Error.message.includes('no rows')) {
      console.error('Error updating F23 to F29:', f29Error)
    }

    if (certError && !certError.message.includes('duplicate')) {
      console.error('Error adding Certificado de Afiliaciones:', certError)
    }

    return NextResponse.json({
      success: true,
      message: 'Document types updated successfully',
      updates: {
        f29_updated: f29Data ? 'Updated F23 to F29' : 'F23 not found or already updated',
        cert_afiliaciones_added: certData ? 'Added Certificado de Afiliaciones' : 'Already exists'
      }
    }, { status: 200 })
  } catch (error: any) {
    console.error('Error in update-document-types:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
