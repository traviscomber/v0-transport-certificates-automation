import { NextResponse, NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAuth } from '@/lib/auth-middleware'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/init-document-requirements
 * Initializes the document_requirements table with all required documents for subcontractors
 * 
 * Only accessible to super-admin users (@labbe.cl)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication - only super-admins can init
    const { user, error: authError } = await verifyAuth(request)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is super-admin
    if (!user.email?.endsWith('@labbe.cl')) {
      return NextResponse.json(
        { error: 'Only @labbe.cl users can initialize requirements' },
        { status: 403 }
      )
    }

    const supabase = createAdminClient()

    // Check if requirements already exist
    const { count: existingCount } = await supabase
      .from('document_requirements')
      .select('*', { count: 'exact', head: true })

    if ((existingCount || 0) > 4) {
      return NextResponse.json(
        { message: 'Document requirements already initialized', count: existingCount },
        { status: 200 }
      )
    }

    // Insert EMPRESA (Company) requirements
    await supabase.from('document_requirements').insert([
      {
        code: 'CEDULA_IDENTIDAD',
        nombre: 'Cédula de Identidad',
        descripcion: 'Documento de identidad vigente del representante legal',
        category: 'Empresa',
        applicable_to: ['subcontratacion'],
        is_active: true,
        dias_vigencia: 2555,
      },
      {
        code: 'RUT_CERTIFICADO',
        nombre: 'Certificado RUT',
        descripcion: 'Certificado de RUT del SII (Estado tributario)',
        category: 'Empresa',
        applicable_to: ['subcontratacion'],
        is_active: true,
        dias_vigencia: 365,
      },
      {
        code: 'CERTIFICADO_ANTECEDENTES',
        nombre: 'Certificado de Antecedentes',
        descripcion: 'Certificado de antecedentes de la empresa del SII',
        category: 'Empresa',
        applicable_to: ['subcontratacion'],
        is_active: true,
        dias_vigencia: 365,
      },
      {
        code: 'CONTRATO_VIGENTE',
        nombre: 'Contrato con Mandante',
        descripcion: 'Copia del contrato vigente con el mandante/transportista principal',
        category: 'Empresa',
        applicable_to: ['subcontratacion'],
        is_active: true,
        dias_vigencia: 0,
      },
      {
        code: 'ESCRITURA_CONSTITUCION',
        nombre: 'Escritura de Constitución',
        descripcion: 'Escritura pública de constitución de la empresa (si aplica)',
        category: 'Empresa',
        applicable_to: ['subcontratacion'],
        is_active: true,
        dias_vigencia: 0,
      },
    ])

    // Insert SUBCONTRATACIÓN (Subcontracting/Vehicle) requirements
    await supabase.from('document_requirements').insert([
      {
        code: 'PERMISO_CIRCULACION',
        nombre: 'Permiso de Circulación',
        descripcion: 'Permiso de Circulación vigente del vehículo',
        category: 'Subcontratación',
        applicable_to: ['subcontratacion'],
        is_active: true,
        dias_vigencia: 365,
      },
      {
        code: 'REVISION_TECNICA',
        nombre: 'Revisión Técnica del Vehículo',
        descripcion: 'Certificado de Revisión Técnica vigente (Gas, Electricidad, etc.)',
        category: 'Subcontratación',
        applicable_to: ['subcontratacion'],
        is_active: true,
        dias_vigencia: 365,
      },
      {
        code: 'LICENCIA_CONDUCTOR',
        nombre: 'Licencia de Conducir',
        descripcion: 'Licencia de Conducir vigente del conductor profesional',
        category: 'Subcontratación',
        applicable_to: ['subcontratacion'],
        is_active: true,
        dias_vigencia: 730,
      },
      {
        code: 'PASAPORTE_CONDUCTOR',
        nombre: 'Pasaporte Conducción',
        descripcion: 'Pasaporte de Conducción (si aplica - transporte internacional)',
        category: 'Subcontratación',
        applicable_to: ['subcontratacion'],
        is_active: true,
        dias_vigencia: 730,
      },
      {
        code: 'CERTIFICADO_SEGURO',
        nombre: 'Certificado de Seguro',
        descripcion: 'Póliza de Seguro de Responsabilidad Civil vigente',
        category: 'Subcontratación',
        applicable_to: ['subcontratacion'],
        is_active: true,
        dias_vigencia: 365,
      },
      {
        code: 'DECLARACION_CARGA',
        nombre: 'Declaración de Carga',
        descripcion: 'Declaración de compatibilidad de carga según tipo de vehículo',
        category: 'Subcontratación',
        applicable_to: ['subcontratacion'],
        is_active: true,
        dias_vigencia: 0,
      },
    ])

    // Verify that requirements already exist (they do from the certifications script), so just add more if needed
    const { data: existingRequirements } = await supabase
      .from('document_requirements')
      .select('code')
      .in('code', ['ARIZTIA', 'LTS', 'RENDIC', 'INTERPOLAR'])

    if ((existingRequirements?.length || 0) === 0) {
      // Insert CERTIFICACIONES (Certifications) if they don't exist
      await supabase.from('document_requirements').insert([
        {
          code: 'ARIZTIA',
          nombre: 'Certificación Ariztia',
          descripcion: 'Certificación de membresía en Ariztia (Asociación del Transporte)',
          category: 'certificaciones',
          applicable_to: ['subcontratacion'],
          is_active: true,
          dias_vigencia: 365,
        },
        {
          code: 'LTS',
          nombre: 'Certificación LTS',
          descripcion: 'Certificación LTS (Logística y Transporte Sustentable)',
          category: 'certificaciones',
          applicable_to: ['subcontratacion'],
          is_active: true,
          dias_vigencia: 365,
        },
        {
          code: 'RENDIC',
          nombre: 'Certificación Rendic',
          descripcion: 'Certificación Rendic (Red Nacional de Distribuidores)',
          category: 'certificaciones',
          applicable_to: ['subcontratacion'],
          is_active: true,
          dias_vigencia: 365,
        },
        {
          code: 'INTERPOLAR',
          nombre: 'Certificación Interpolar',
          descripcion: 'Certificación Interpolar (Asociación Empresarial)',
          category: 'certificaciones',
          applicable_to: ['subcontratacion'],
          is_active: true,
          dias_vigencia: 365,
        },
      ])
    }

    // Verify final count
    const { count: finalCount } = await supabase
      .from('document_requirements')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    return NextResponse.json(
      {
        success: true,
        message: 'Document requirements initialized successfully',
        total_requirements: finalCount,
        requirements: {
          empresa: 5,
          subcontratacion: 6,
          certificaciones: 4,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[v0] Error initializing requirements:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to initialize requirements',
      },
      { status: 500 }
    )
  }
}
