import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/subcontractors/[id]/documents
 * Fetch all documents and requirements for a specific subcontractor
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const subcontractorId = params.id

    if (!subcontractorId) {
      return NextResponse.json(
        { error: 'Subcontractor ID is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Fetch documents uploaded by this subcontractor
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('*')
      .eq('subcontratista_id', subcontractorId)
      .order('fecha_subida', { ascending: false })

    if (docsError) {
      console.error('[v0] Error fetching documents:', docsError)
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 500 }
      )
    }

    // Fetch document requirements for transportistas
    const { data: requirements, error: reqError } = await supabase
      .from('document_requirements')
      .select('*')
      .eq('is_active', true)
      .eq('applicable_to_transportista', true)
      .order('code', { ascending: true })

    if (reqError) {
      console.error('[v0] Error fetching requirements:', reqError)
      return NextResponse.json(
        { error: 'Failed to fetch requirements' },
        { status: 500 }
      )
    }

    // Fetch subcontractor to get certification flags
    const { data: subcontractor, error: subError } = await supabase
      .from('transportistas')
      .select('id, rut, ariztia, lts, rendic, interpolar')
      .eq('id', subcontractorId)
      .single()

    if (subError) {
      console.error('[v0] Error fetching subcontractor:', subError)
      return NextResponse.json(
        { error: 'Subcontractor not found' },
        { status: 404 }
      )
    }

    // Calculate certification counts (these are boolean flags, so max 1 each)
    const certificationsCount = {
      ariztia: subcontractor.ariztia ? 1 : 0,
      lts: subcontractor.lts ? 1 : 0,
      rendic: subcontractor.rendic ? 1 : 0,
      interpolar: subcontractor.interpolar ? 1 : 0,
    }

    // Map document requirements with compliance status
    const requirementsWithStatus = requirements?.map((req) => {
      const uploadedDoc = documents?.find(
        (d) =>
          d.tipo === req.code &&
          (d.estado === 'aprobado' || d.estado === 'vencido')
      )

      return {
        ...req,
        status: uploadedDoc
          ? uploadedDoc.estado
          : 'no_subido',
        uploadedDocument: uploadedDoc || null,
      }
    }) || []

    return NextResponse.json({
      success: true,
      subcontractorId,
      documents: documents || [],
      requirements: requirementsWithStatus,
      certificationsCount,
      summary: {
        totalDocumentsUploaded: documents?.length || 0,
        totalRequirements: requirements?.length || 0,
        approvedDocuments:
          documents?.filter((d) => d.estado === 'aprobado').length || 0,
        pendingDocuments:
          documents?.filter((d) => d.estado === 'pendiente').length || 0,
        expiredDocuments:
          documents?.filter((d) => d.estado === 'vencido').length || 0,
      },
    })
  } catch (error) {
    console.error('[v0] Error in subcontractor documents endpoint:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}
