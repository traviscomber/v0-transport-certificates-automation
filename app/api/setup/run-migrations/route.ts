import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST() {
  const logs: string[] = []
  
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // 1. Create storage bucket
    logs.push('Creando bucket de storage "documents"...')
    const { error: storageError } = await supabase.storage.createBucket('documents', {
      public: false,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
    })
    
    if (storageError && !storageError.message.includes('already exists')) {
      logs.push(`Error creando bucket: ${storageError.message}`)
    } else {
      logs.push('Bucket "documents" creado o ya existe')
    }

    // 2. Insert default document types if table exists
    logs.push('Verificando tipos de documentos...')
    
    const documentTypes = [
      { code: 'LIC_CONDUCIR', name: 'Licencia de Conducir', category: 'conductor', is_mandatory: true, validity_days: 365 },
      { code: 'CERT_ANTECEDENTES', name: 'Certificado de Antecedentes', category: 'conductor', is_mandatory: true, validity_days: 90 },
      { code: 'HOJA_VIDA', name: 'Hoja de Vida del Conductor', category: 'conductor', is_mandatory: true, validity_days: null },
      { code: 'REVISION_TECNICA', name: 'Revision Tecnica', category: 'vehiculo', is_mandatory: true, validity_days: 365 },
      { code: 'SOAP', name: 'Seguro Obligatorio (SOAP)', category: 'vehiculo', is_mandatory: true, validity_days: 365 },
      { code: 'PERMISO_CIRCULACION', name: 'Permiso de Circulacion', category: 'vehiculo', is_mandatory: true, validity_days: 365 },
      { code: 'PADRON', name: 'Padron Vehicular', category: 'vehiculo', is_mandatory: true, validity_days: null },
      { code: 'POLIZA_RC', name: 'Poliza Responsabilidad Civil', category: 'empresa', is_mandatory: true, validity_days: 365 },
      { code: 'CERT_EMPRESA', name: 'Certificado de Empresa', category: 'empresa', is_mandatory: true, validity_days: 365 },
      { code: 'CONTRATO_TRABAJO', name: 'Contrato de Trabajo', category: 'conductor', is_mandatory: true, validity_days: null },
      { code: 'F30', name: 'Formulario F30 (Previred)', category: 'subcontratacion', is_mandatory: true, validity_days: 30 },
      { code: 'F30_1', name: 'Formulario F30-1', category: 'subcontratacion', is_mandatory: true, validity_days: 30 },
      { code: 'CERT_AFP', name: 'Certificado de AFP', category: 'subcontratacion', is_mandatory: true, validity_days: 30 },
      { code: 'CERT_ISAPRE', name: 'Certificado de Isapre/Fonasa', category: 'subcontratacion', is_mandatory: true, validity_days: 30 },
      { code: 'GUIA_DESPACHO', name: 'Guia de Despacho', category: 'operacional', is_mandatory: true, validity_days: null },
      { code: 'MANIFIESTO_CARGA', name: 'Manifiesto de Carga', category: 'operacional', is_mandatory: false, validity_days: null },
      { code: 'CARTA_PORTE', name: 'Carta Porte', category: 'operacional', is_mandatory: false, validity_days: null },
      { code: 'CERT_FUMIGACION', name: 'Certificado de Fumigacion', category: 'seguridad', is_mandatory: false, validity_days: 180 },
      { code: 'PLAN_EMERGENCIA', name: 'Plan de Emergencia', category: 'seguridad', is_mandatory: false, validity_days: 365 },
      { code: 'CERT_CAPACITACION', name: 'Certificado de Capacitacion', category: 'conductor', is_mandatory: false, validity_days: 365 },
    ]

    const { error: insertError } = await supabase
      .from('document_types')
      .upsert(documentTypes, { onConflict: 'code' })

    if (insertError) {
      if (insertError.message.includes('does not exist')) {
        logs.push('Tabla document_types no existe - ejecuta el SQL manualmente')
      } else {
        logs.push(`Error insertando tipos: ${insertError.message}`)
      }
    } else {
      logs.push(`${documentTypes.length} tipos de documentos insertados/actualizados`)
    }

    // 3. Create demo organization
    logs.push('Creando organizacion demo...')
    const { error: orgError } = await supabase
      .from('organizations')
      .upsert([
        { 
          name: 'Empresa Demo', 
          rut: '76.123.456-7', 
          type: 'transportista',
          address: 'Av. Principal 123',
          city: 'Santiago',
          region: 'Metropolitana',
          phone: '+56 2 1234 5678',
          email: 'contacto@empresademo.cl',
          is_active: true,
          compliance_score: 85
        }
      ], { onConflict: 'rut' })

    if (orgError) {
      if (orgError.message.includes('does not exist')) {
        logs.push('Tabla organizations no existe - ejecuta el SQL manualmente')
      } else {
        logs.push(`Error creando org demo: ${orgError.message}`)
      }
    } else {
      logs.push('Organizacion demo creada')
    }

    return NextResponse.json({ 
      success: true, 
      logs 
    })
  } catch (error) {
    logs.push(`Error general: ${error}`)
    return NextResponse.json({ 
      success: false, 
      error: String(error),
      logs 
    }, { status: 500 })
  }
}
