import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  try {
    console.log('[v0] Fetching real data from Supabase for subcontractors and drivers')

    // Fetch real transportistas from the transportistas table
    const { data: subcontratistas, error: subcontratistasError } = await supabase
      .from('transportistas')
      .select('*')
      .order('razon_social', { ascending: true })

    if (subcontratistasError) {
      console.error('[v0] Error fetching transportistas:', subcontratistasError)
      throw subcontratistasError
    }

    // Fetch real conductores (drivers)
    const { data: conductores, error: conductoresError } = await supabase
      .from('conductores')
      .select('id, rut, nombres, apellido_paterno, apellido_materno, transportista_id, rut_proveedor, is_active, created_at')
      .order('nombres', { ascending: true })

    if (conductoresError) {
      console.error('[v0] Error fetching conductores:', conductoresError)
      throw conductoresError
    }

    // Create a map of transportista_id to transportista for quick lookup
    const transportistaMap = new Map(subcontratistas?.map(s => [s.id, s]) || [])

    // Format subcontractors with active driver count
    const subcontractorsData = (subcontratistas || []).map(s => {
      // Count active drivers for this subcontractor by matching rut_proveedor
      const activeDriverCount = (conductores || []).filter(c => 
        c.rut_proveedor === s.rut && c.is_active === true
      ).length

      return {
        id: s.id,
        nombre: s.razon_social,
        nombre_fantasia: s.razon_social || '',
        rut: s.rut || '',
        region: s.region || 'N/A',
        ejecutiva: 'N/A', // Se asigna por RUT en el frontend si es necesario
        comuna: s.comuna || 'N/A',
        representante: s.nombre_contacto || '',
        telefono: s.telefono || '',
        email: s.email || '',
        ariztia: false,
        lts: false,
        rendic: false,
        interpolar: false,
        is_active: s.is_active || true,
        created_at: s.created_at,
        activeDriverCount: activeDriverCount,
      }
    })

    // Create a map of RUT to transportista for quick lookup of provider names
    const rutToSubcontratista = new Map(subcontratistas?.map(s => [s.rut, s]) || [])

    // Format drivers - use rut_proveedor to lookup the actual company name from transportistas
    const driversData = (conductores || []).map(c => {
      const transportista = rutToSubcontratista.get(c.rut_proveedor)
      return {
        id: c.id,
        rut: c.rut || '',
        nombre: `${c.nombres || ''} ${c.apellido_paterno || ''} ${c.apellido_materno || ''}`.trim(),
        rut_proveedor: c.rut_proveedor || '',
        proveedor: transportista?.razon_social || c.rut_proveedor || 'N/A',
        is_active: c.is_active || true,
      }
    })

    // Fetch document types
    const { data: documentTypes, error: docTypesError } = await supabase
      .from('document_types')
      .select('id, code, name, category, is_mandatory, validity_days')
      .eq('is_active', true)
      .order('category', { ascending: true })

    if (docTypesError) {
      console.error('[v0] Error fetching document types:', docTypesError)
    }

    // Fallback document types if database fetch fails
    const defaultDocumentTypes = [
      { 
        id: '550e8400-e29b-41d4-a716-446655440001',
        code: 'LICENCIA_CONDUCIR',
        name: 'Licencia de Conducir Profesional',
        category: 'Licencias',
        is_mandatory: true,
        validity_days: 365
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        code: 'ANTECEDENTES_PENALES',
        name: 'Certificado de Antecedentes Penales',
        category: 'Certificados',
        is_mandatory: true,
        validity_days: 365
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        code: 'CERTIFICADO_MEDICO',
        name: 'Certificado Médico Ocupacional',
        category: 'Certificados',
        is_mandatory: true,
        validity_days: 365
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        code: 'COMPROBANTE_DOMICILIO',
        name: 'Comprobante de Domicilio',
        category: 'Identificación',
        is_mandatory: false,
        validity_days: 180
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440005',
        code: 'CONTRATO',
        name: 'Contrato de Trabajo',
        category: 'Documentos',
        is_mandatory: false,
        validity_days: null
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440006',
        code: 'OTRO',
        name: 'Otro',
        category: 'General',
        is_mandatory: false,
        validity_days: null
      }
    ]

    // Hard-coded executives (6 de Labbe)
    const executivesData = [
      { id: '1', full_name: 'Olga Carrasco', rut: '10574005-0', email: 'ocarrasco@labbe.cl', phone: '+56912345678', cargo: 'Ejecutiva de Cuenta' },
      { id: '2', full_name: 'Carolina Sepúlveda', rut: '15464094-0', email: 'csepulveda@labbe.cl', phone: '+56913456789', cargo: 'Ejecutiva de Cuenta' },
      { id: '3', full_name: 'Daniela Silva', rut: '17768246-2', email: 'dsilva@labbe.cl', phone: '+56914567890', cargo: 'Ejecutiva de Cuenta' },
      { id: '4', full_name: 'Cecilia Farias', rut: '9888992-2', email: 'cfarias@labbe.cl', phone: '+56914567891', cargo: 'Ejecutiva de Cuenta' },
      { id: '5', full_name: 'Diego González', rut: '20114106-0', email: 'dgonzalez@labbe.cl', phone: '+56915678901', cargo: 'Ejecutivo de Cuenta' },
      { id: '6', full_name: 'Katherinne Canales', rut: '18717311-6', email: 'kcanales@labbe.cl', phone: '+56916789012', cargo: 'Ejecutiva de Cuenta' },
    ]

    const response = {
      company: {
        id: '1',
        rut: '78376780-5',
        razon_social: 'LABBE TRANSPORTES Y CIAS LTDA.',
        nombre_fantasia: 'LABBE TRANSPORTES',
        email: 'contacto@transporteslabbe.cl',
        telefono: '+56912345678',
        region: 'RM',
        ciudad: 'Santiago',
        representante_legal: 'José Patricio Armando Labbé Cereceda',
        is_active: true
      },
      executives: executivesData,
      drivers: driversData,
      subcontractors: subcontractorsData,
      documentTypes: (documentTypes && documentTypes.length > 0) ? documentTypes : defaultDocumentTypes,
      stats: {
        totalSubcontractors: subcontractorsData.length,
        totalDrivers: driversData.length
      }
    }

    console.log('[v0] Loaded:', subcontractorsData.length, 'transportistas,', driversData.length, 'drivers')
    
    // Add cache-busting headers to ensure fresh data
    const response_obj = NextResponse.json(response)
    response_obj.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
    response_obj.headers.set('Pragma', 'no-cache')
    response_obj.headers.set('Expires', '0')
    return response_obj
  } catch (error) {
    console.error('[v0] Error in company data endpoint:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to fetch company data', details: errorMessage },
      { status: 500 }
    )
  }
}
