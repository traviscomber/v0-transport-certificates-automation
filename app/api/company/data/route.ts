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

    // Fallback document types using real UUIDs from database
    const defaultDocumentTypes = [
      // conductor
      { id: '3803861c-5ff3-40ba-a6d7-de8245bc3cd2', code: 'CEDULA-IDENTIDAD',          name: 'Cedula de Identidad',                    category: 'conductor', is_mandatory: true,  validity_days: null },
      { id: 'c6b67a33-a1d8-4e62-bbe8-01c22e9ff8c0', code: 'CERTIFICADO-AFP',            name: 'Certificado AFP',                        category: 'conductor', is_mandatory: false, validity_days: 30   },
      { id: '5370a5e6-9d20-4ee3-b19a-e54fdef1c952', code: 'CERTIFICADO-ANTECEDENTES',   name: 'Certificado de Antecedentes',            category: 'conductor', is_mandatory: true,  validity_days: 90   },
      { id: '51c5a75a-8f97-4e90-812c-69c334bfdcac', code: 'CERT_CAPACITACION',          name: 'Certificado de Capacitacion',            category: 'conductor', is_mandatory: false, validity_days: 365  },
      { id: '0d7f1fc2-e052-4565-b9ec-d8a98204dd22', code: 'CERTIFICADO-SALUD',          name: 'Certificado de Salud',                   category: 'conductor', is_mandatory: true,  validity_days: 365  },
      { id: 'e17d797e-e9c3-4642-8f36-862a46b371dc', code: 'INHABILIDADES-MENORES',      name: 'Certificado Inhabilidades Menores',      category: 'conductor', is_mandatory: true,  validity_days: 90   },
      { id: '3b53c0a2-8607-4c2b-85cf-96a281797c6a', code: 'CONTRATO-TRABAJO',           name: 'Contrato de Trabajo',                    category: 'conductor', is_mandatory: true,  validity_days: null },
      { id: 'b166d526-932d-4497-a5a7-febcb45d385d', code: 'EXAMEN-PREOCUPACIONAL',      name: 'Examen Preocupacional',                  category: 'conductor', is_mandatory: true,  validity_days: 365  },
      { id: 'a53defca-5f31-4ef9-893e-e63ce07929f6', code: 'HOJA-VIDA-CONDUCTOR',        name: 'Hoja de Vida del Conductor',             category: 'conductor', is_mandatory: false, validity_days: null },
      { id: '48e5d7a6-2c92-4616-8eed-e56a956e2c6a', code: 'LICENCIA-CONDUCIR',          name: 'Licencia de Conducir Profesional',       category: 'conductor', is_mandatory: true,  validity_days: 365  },
      // empresa
      { id: '07805731-57e2-4fff-b92e-93159e580c54', code: 'CEDULA-REPRESENTANTE',       name: 'Cedula Representante Legal',             category: 'empresa',   is_mandatory: true,  validity_days: null },
      { id: '96a5ac2e-38a7-4f69-a4e0-9a8eceea4aa8', code: 'CERTIFICADO-VIGENCIA',       name: 'Certificado de Vigencia',                category: 'empresa',   is_mandatory: true,  validity_days: 365  },
      { id: '9f05ad19-c5f6-45df-a4eb-4b519814c01b', code: 'ESCRITURA-CONSTITUCION',     name: 'Escritura de Constitucion',              category: 'empresa',   is_mandatory: true,  validity_days: null },
      { id: '29e8f29c-88f0-45e3-9457-d353b669ff58', code: 'PODER-REPRESENTANTE',        name: 'Poder del Representante Legal',          category: 'empresa',   is_mandatory: true,  validity_days: null },
      { id: '7e718072-281a-454e-af5d-183c979eff91', code: 'POLIZA_RC',                  name: 'Poliza Responsabilidad Civil',           category: 'empresa',   is_mandatory: true,  validity_days: 365  },
      { id: 'c9aee93a-0af4-4e31-8c18-ea6826b29b44', code: 'RUT-EMPRESA',                name: 'RUT Empresa',                            category: 'empresa',   is_mandatory: true,  validity_days: null },
      // operacional
      { id: '51387fd4-760d-4479-8bea-c6ff6d64517f', code: 'CARTA-PORTE',                name: 'Carta de Porte',                         category: 'operacional', is_mandatory: false, validity_days: null },
      { id: '389cf3ca-4594-45a7-a5cd-016f14af3575', code: 'DOCUMENTOS-CARGA',           name: 'Documentos de Carga',                    category: 'operacional', is_mandatory: false, validity_days: null },
      { id: 'dbd6cd6d-36a2-4b64-87e9-dd9140ac99bf', code: 'GUIA-DESPACHO',              name: 'Guia de Despacho',                       category: 'operacional', is_mandatory: false, validity_days: null },
      { id: 'ad8cd64f-2d37-4302-bb45-885ff13dab15', code: 'ORDEN-TRANSPORTE',           name: 'Orden de Transporte',                    category: 'operacional', is_mandatory: false, validity_days: null },
      { id: '34ea2783-f934-44aa-83bd-5fd31e9c413f', code: 'REGISTRO-ENTREGA',           name: 'Registro de Entrega',                    category: 'operacional', is_mandatory: false, validity_days: null },
      // seguridad
      { id: '94127e2f-2a46-4e5f-bb0e-f5297cbb88ab', code: 'CERT_FUMIGACION',            name: 'Certificado de Fumigacion',              category: 'seguridad', is_mandatory: false, validity_days: 180  },
      { id: '48161471-a9ae-45cc-b644-8e1493984138', code: 'MATRIZ-RIESGOS',             name: 'Matriz de Identificacion de Riesgos',   category: 'seguridad', is_mandatory: true,  validity_days: 365  },
      { id: '3bb126b7-fea5-4801-8297-0f68573798f0', code: 'PLAN_EMERGENCIA',            name: 'Plan de Emergencia',                     category: 'seguridad', is_mandatory: true,  validity_days: 365  },
      { id: '82cdd664-db23-43ea-82a6-95ff2dd7c33c', code: 'PROCEDIMIENTOS-SEGURIDAD',   name: 'Procedimientos de Trabajo Seguro',       category: 'seguridad', is_mandatory: true,  validity_days: 365  },
      { id: '3a632d99-d326-4bee-8a27-09258ce9f5c4', code: 'PROTOCOLO-ACCIDENTES',       name: 'Protocolo de Accidentes',                category: 'seguridad', is_mandatory: true,  validity_days: 365  },
      { id: '01230712-c049-424c-b0ec-cfc546644e38', code: 'CAPACITACIONES',             name: 'Registro de Capacitaciones',             category: 'seguridad', is_mandatory: false, validity_days: null },
      { id: '8e618073-7398-4e5d-8b85-3f0e3b981715', code: 'REGLAMENTO-INTERNO',         name: 'Reglamento Interno de Seguridad',        category: 'seguridad', is_mandatory: true,  validity_days: 365  },
      // subcontratacion
      { id: '54143886-5ba5-4c6e-b735-b79d8ab6f49e', code: 'CUMPLIMIENTO-PREVISIONAL',   name: 'Certificado Cumplimiento Previsional',   category: 'subcontratacion', is_mandatory: true,  validity_days: 30  },
      { id: '0144c665-17ac-4eab-b549-b6c631efa219', code: 'CERT_AFP',                   name: 'Certificado de AFP',                     category: 'subcontratacion', is_mandatory: true,  validity_days: 30  },
      { id: '7146b0bb-6289-465b-b179-d5046b3caeb3', code: 'CERT_ISAPRE',                name: 'Certificado de Isapre/Fonasa',           category: 'subcontratacion', is_mandatory: true,  validity_days: 30  },
      { id: '8dc71cda-b02e-4313-aa09-7adf577e38f3', code: 'F30-1',                      name: 'Certificado F30-1',                      category: 'subcontratacion', is_mandatory: true,  validity_days: 30  },
      { id: '1b4c4b69-0d83-4a98-b96e-1849dad6e534', code: 'CONTRATO-SUBCONTRATACION',   name: 'Contrato de Subcontratacion',            category: 'subcontratacion', is_mandatory: true,  validity_days: null },
      { id: '2d1111a8-0848-4639-b6bb-64570dfd9a17', code: 'F30',                        name: 'Formulario F30 (Previred)',              category: 'subcontratacion', is_mandatory: true,  validity_days: 30  },
      // vehiculo
      { id: 'e3a9dd6d-346a-4c61-a751-c31eafc5c4aa', code: 'CERTIFICADO-EMISIONES',      name: 'Certificado de Emisiones',               category: 'vehiculo', is_mandatory: true,  validity_days: 365  },
      { id: 'e81a219a-46f1-4d91-bb9b-4cc5cbee4d0b', code: 'FOTO-GPS-VEHICULO',          name: 'Fotografia y GPS Vehiculo',              category: 'vehiculo', is_mandatory: false, validity_days: null },
      { id: 'e4a9bc30-c329-4119-9d8a-47c374b40884', code: 'PADRON-VEHICULO',             name: 'Padron del Vehiculo',                    category: 'vehiculo', is_mandatory: true,  validity_days: null },
      { id: 'd2a66161-1434-42e8-8988-6d72dcfaeb56', code: 'PERMISO_CIRCULACION',         name: 'Permiso de Circulacion',                 category: 'vehiculo', is_mandatory: true,  validity_days: 365  },
      { id: '4c3d940c-93ae-4fc7-ab57-8a21b89746a6', code: 'REVISION-TECNICA',            name: 'Revision Tecnica',                       category: 'vehiculo', is_mandatory: true,  validity_days: 365  },
      { id: '4c3cbe46-faaa-4c2c-8857-e4620b1901a2', code: 'SEGURO-CARGA',               name: 'Seguro de Carga',                        category: 'vehiculo', is_mandatory: false, validity_days: 365  },
      { id: '995d4793-e66e-4068-bf4e-d1748ded92fc', code: 'SOAP',                        name: 'Seguro Obligatorio (SOAP)',              category: 'vehiculo', is_mandatory: true,  validity_days: 365  },
      { id: 'fad01a05-08fa-4850-9877-46e6b5d90614', code: 'SEGURO-RC',                  name: 'Seguro Responsabilidad Civil',           category: 'vehiculo', is_mandatory: true,  validity_days: 365  },
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
