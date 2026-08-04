import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type FocusMode = 'company' | 'conductor'

type Focus = {
  mode: FocusMode
  id: string
}

function getFocus(request: Request): Focus | null {
  const url = new URL(request.url)
  const mode = url.searchParams.get('focus_mode')
  const id = url.searchParams.get('focus_id')

  if ((mode !== 'company' && mode !== 'conductor') || !id) return null
  return { mode, id }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const focus = getFocus(request)

    const [conductorResult, subResult, conductorTypesResult, subTypesResult, executivesResult] = await Promise.all([
      supabase
        .from('uploaded_documents')
        .select(`
          id,
          original_filename,
          document_type_id,
          validation_status,
          file_url,
          created_at,
          updated_at,
          document_period_month,
          document_period_year,
          document_period_start,
          conductor_id,
          version_number,
          is_current,
          conductores (
            id,
            nombres,
            apellido_paterno,
            rut,
            rut_proveedor
          )
        `)
        .eq('is_current', true)
        .or('validation_status.eq.pending,validation_status.is.null')
        .order('created_at', { ascending: false })
        .limit(10000),
      supabase
        .from('subcontractor_documents')
        .select(`
          id,
          file_name,
          document_type_id,
          status,
          file_url,
          created_at,
          updated_at,
          uploaded_at,
          subcontractor_id,
          subcontractor_rut,
          reviewed_by_ejecutiva,
          uploaded_by_ejecutiva,
          document_period_month,
          document_period_year,
          document_period_start,
          version_number,
          is_current
        `)
        .eq('is_current', true)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(10000),
      supabase.from('document_types').select('id, code, name'),
      supabase.from('subcontractor_document_types').select('id, code, nombre'),
      supabase.from('executive_staff').select('id, full_name'),
    ])

    if (conductorResult.error) throw conductorResult.error
    if (subResult.error) throw subResult.error
    if (conductorTypesResult.error) throw conductorTypesResult.error
    if (subTypesResult.error) throw subTypesResult.error
    if (executivesResult.error) throw executivesResult.error

    const conductorDocs = conductorResult.data || []
    const subDocs = subResult.data || []

    const conductorTypeMap = new Map(
      (conductorTypesResult.data || []).map((item) => [item.id, { code: item.code, nombre: item.name }]),
    )

    const deprecatedCodes = new Set(['AFP', 'SALUD', 'MUTUAL', 'SEGURO_SOCIAL'])
    const subTypeMap = new Map(
      (subTypesResult.data || [])
        .filter((item) => !deprecatedCodes.has(item.code))
        .map((item) => [item.id, { code: item.code, nombre: item.nombre }]),
    )

    const executiveNameMap = new Map(
      (executivesResult.data || []).map((item) => [item.id, item.full_name]),
    )

    const providerRuts = [
      ...new Set(
        conductorDocs
          .map((doc: any) => doc.conductores?.rut_proveedor)
          .filter(Boolean),
      ),
    ]

    const subIds = [...new Set(subDocs.map((doc: any) => doc.subcontractor_id).filter(Boolean))]

    const transportistaQuery = supabase
      .from('transportistas')
      .select('id, rut, razon_social, assigned_executive_id')

    const [providerCompaniesResult, subCompaniesResult] = await Promise.all([
      providerRuts.length > 0 ? transportistaQuery.in('rut', providerRuts) : Promise.resolve({ data: [], error: null }),
      subIds.length > 0
        ? supabase
            .from('transportistas')
            .select('id, rut, razon_social, assigned_executive_id')
            .in('id', subIds)
        : Promise.resolve({ data: [], error: null }),
    ])

    if (providerCompaniesResult.error) throw providerCompaniesResult.error
    if (subCompaniesResult.error) throw subCompaniesResult.error

    const companyByRut = new Map((providerCompaniesResult.data || []).map((item: any) => [item.rut, item]))
    const companyById = new Map((subCompaniesResult.data || []).map((item: any) => [item.id, item]))

    const normalizedConductorDocs = conductorDocs.map((doc: any) => {
      const company = companyByRut.get(doc.conductores?.rut_proveedor)
      return {
        id: doc.id,
        original_filename: doc.original_filename,
        document_name: doc.original_filename,
        file_name: doc.original_filename,
        document_type_id: doc.document_type_id,
        validation_status: doc.validation_status,
        status: doc.validation_status || 'pending',
        file_url: doc.file_url,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        uploaded_at: doc.created_at,
        document_period_month: doc.document_period_month,
        document_period_year: doc.document_period_year,
        document_period_start: doc.document_period_start,
        version_number: doc.version_number,
        is_current: true,
        conductores: doc.conductores,
        docType: conductorTypeMap.get(doc.document_type_id) || null,
        transportistas: company || null,
        empresa_nombre: company?.razon_social || null,
        company_id: company?.id || null,
        ejecutiva: company?.assigned_executive_id
          ? executiveNameMap.get(company.assigned_executive_id) || 'Sin asignar'
          : 'Sin asignar',
        document_source: 'conductor',
      }
    })

    const normalizedSubDocs = subDocs.map((doc: any) => {
      const company = companyById.get(doc.subcontractor_id)
      return {
        id: doc.id,
        file_name: doc.file_name,
        document_name: doc.file_name,
        original_filename: doc.file_name,
        document_type_id: doc.document_type_id,
        status: doc.status,
        file_url: doc.file_url,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        uploaded_at: doc.uploaded_at,
        subcontractor_id: doc.subcontractor_id,
        subcontractor_rut: doc.subcontractor_rut,
        reviewed_by_ejecutiva: doc.reviewed_by_ejecutiva,
        uploaded_by_ejecutiva: doc.uploaded_by_ejecutiva,
        document_period_month: doc.document_period_month,
        document_period_year: doc.document_period_year,
        document_period_start: doc.document_period_start,
        version_number: doc.version_number,
        is_current: true,
        transportistas: company || null,
        empresa_nombre: company?.razon_social || null,
        docType: subTypeMap.get(doc.document_type_id) || null,
        company_id: doc.subcontractor_id,
        ejecutiva: company?.assigned_executive_id
          ? executiveNameMap.get(company.assigned_executive_id) || 'Sin asignar'
          : 'Sin asignar',
        document_source: 'subcontractor',
      }
    })

    const filteredConductorDocs = focus
      ? normalizedConductorDocs.filter((doc: any) =>
          focus.mode === 'conductor' ? doc.conductores?.id === focus.id : doc.company_id === focus.id,
        )
      : normalizedConductorDocs

    const filteredSubDocs = focus
      ? normalizedSubDocs.filter((doc: any) => focus.mode === 'company' && doc.company_id === focus.id)
      : normalizedSubDocs

    return NextResponse.json({
      conductorDocs: filteredConductorDocs,
      subDocs: filteredSubDocs,
      scope: 'current_documents_only',
      success: true,
    })
  } catch (error) {
    console.error('[v0] Error fetching current pending documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pending documents', success: false },
      { status: 500 },
    )
  }
}
