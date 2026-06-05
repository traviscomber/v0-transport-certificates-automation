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

    // Step 1: Remove Certificado de Afiliaciones (CERT_AFILIACIONES)
    const { data: removed1, error: err1 } = await supabase
      .from('subcontractor_document_types')
      .delete()
      .eq('code', 'CERT_AFILIACIONES')
      .select()

    console.log(`Removed ${removed1?.length || 0} Certificado de Afiliaciones entries`)
    if (err1) console.error('Error removing Certificado de Afiliaciones:', err1)

    // Step 2: Remove Certificado de Vacunaciones (CV)
    const { data: removed2, error: err2 } = await supabase
      .from('subcontractor_document_types')
      .delete()
      .eq('code', 'CV')
      .select()

    console.log(`Removed ${removed2?.length || 0} Certificado de Vacunaciones entries`)
    if (err2) console.error('Error removing Certificado de Vacunaciones:', err2)

    // Step 3: Add Planilla de SEGURO SOCIAL if not exists
    const { data: checkSeguro, error: checkErr } = await supabase
      .from('subcontractor_document_types')
      .select('id')
      .eq('code', 'SEGURO_SOCIAL')
      .limit(1)

    let addedSeguro = null
    let seguroStatus = 'already_exists'

    if (checkSeguro && checkSeguro.length === 0) {
      const { data: added, error: addErr } = await supabase
        .from('subcontractor_document_types')
        .insert({
          code: 'SEGURO_SOCIAL',
          nombre: 'Planilla de SEGURO SOCIAL',
          descripcion: 'Planilla mensual de Seguro Social de los trabajadores',
          periodicidad: 'Mensual',
          es_obligatorio: true
        })
        .select()

      if (addErr) {
        console.error('Error adding Planilla de SEGURO SOCIAL:', addErr)
        seguroStatus = 'error'
      } else {
        addedSeguro = added
        seguroStatus = 'added'
        console.log(`Added Planilla de SEGURO SOCIAL`)
      }
    }

    // Get updated list
    const { data: updatedDocs, error: listErr } = await supabase
      .from('subcontractor_document_types')
      .select('*')
      .order('created_at', { ascending: false })

    return NextResponse.json({
      success: true,
      message: 'Document types updated successfully',
      summary: {
        removed_afiliaciones: removed1 ? removed1.length : 0,
        removed_vacunaciones: removed2 ? removed2.length : 0,
        seguro_social_status: seguroStatus,
        total_documents: updatedDocs ? updatedDocs.length : 0
      },
      updated_documents: updatedDocs
    }, { status: 200 })
  } catch (error: any) {
    console.error('Error in update-document-list:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
