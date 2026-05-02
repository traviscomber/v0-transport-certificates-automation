import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST() {
  const logs: string[] = []
  
  try {
    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Supabase configuration missing', logs },
        { status: 500 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    
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
      { code: 'LIC_CONDUCIR', name: 'Licencia de Conducir', category: 'conductor', is_mandatory: true, expiration_days: 365, ai_prompt: 'Extrae numero de licencia, clase, fecha de emision, fecha de vencimiento, nombre completo del titular y RUT' },
      { code: 'CERT_ANTECEDENTES', name: 'Certificado de Antecedentes', category: 'conductor', is_mandatory: true, expiration_days: 90, ai_prompt: 'Extrae nombre completo, RUT, fecha de emision y resultado (con o sin antecedentes)' },
      { code: 'HOJA_VIDA', name: 'Hoja de Vida del Conductor', category: 'conductor', is_mandatory: true, expiration_days: null, ai_prompt: 'Extrae nombre completo, RUT, fecha de nacimiento, experiencia laboral y referencias' },
      { code: 'REVISION_TECNICA', name: 'Revision Tecnica', category: 'vehiculo', is_mandatory: true, expiration_days: 365, ai_prompt: 'Extrae patente, fecha de revision, fecha de vencimiento, planta revisora y resultado' },
      { code: 'SOAP', name: 'Seguro Obligatorio (SOAP)', category: 'vehiculo', is_mandatory: true, expiration_days: 365, ai_prompt: 'Extrae numero de poliza, patente, fecha de inicio, fecha de termino y aseguradora' },
      { code: 'PERMISO_CIRCULACION', name: 'Permiso de Circulacion', category: 'vehiculo', is_mandatory: true, expiration_days: 365, ai_prompt: 'Extrae patente, ano del permiso, fecha de pago, municipalidad y monto pagado' },
      { code: 'PADRON', name: 'Padron Vehicular', category: 'vehiculo', is_mandatory: true, expiration_days: null, ai_prompt: 'Extrae patente, numero de motor, numero de chasis, marca, modelo, ano y propietario' },
      { code: 'POLIZA_RC', name: 'Poliza Responsabilidad Civil', category: 'empresa', is_mandatory: true, expiration_days: 365, ai_prompt: 'Extrae numero de poliza, asegurado, cobertura, monto asegurado, fecha inicio y fecha termino' },
      { code: 'CERT_EMPRESA', name: 'Certificado de Empresa', category: 'empresa', is_mandatory: true, expiration_days: 365, ai_prompt: 'Extrae razon social, RUT empresa, direccion, giro y representante legal' },
      { code: 'CONTRATO_TRABAJO', name: 'Contrato de Trabajo', category: 'conductor', is_mandatory: true, expiration_days: null, ai_prompt: 'Extrae nombre trabajador, RUT, cargo, fecha inicio, tipo de contrato y empleador' },
      { code: 'F30', name: 'Formulario F30 (Previred)', category: 'subcontratacion', is_mandatory: true, expiration_days: 30, ai_prompt: 'Extrae RUT empresa, periodo, numero de trabajadores y monto total pagado' },
      { code: 'F30_1', name: 'Formulario F30-1', category: 'subcontratacion', is_mandatory: true, expiration_days: 30, ai_prompt: 'Extrae RUT empresa, periodo, detalle de trabajadores y montos' },
      { code: 'CERT_AFP', name: 'Certificado de AFP', category: 'subcontratacion', is_mandatory: true, expiration_days: 30, ai_prompt: 'Extrae nombre AFP, RUT empresa, periodo y estado de pago' },
      { code: 'CERT_ISAPRE', name: 'Certificado de Isapre/Fonasa', category: 'subcontratacion', is_mandatory: true, expiration_days: 30, ai_prompt: 'Extrae institucion, RUT empresa, periodo y estado de pago' },
      { code: 'GUIA_DESPACHO', name: 'Guia de Despacho', category: 'operacional', is_mandatory: true, expiration_days: null, ai_prompt: 'Extrae numero de guia, fecha, origen, destino, productos y cantidades' },
      { code: 'MANIFIESTO_CARGA', name: 'Manifiesto de Carga', category: 'operacional', is_mandatory: false, expiration_days: null, ai_prompt: 'Extrae numero de manifiesto, fecha, vehiculo, conductor y detalle de carga' },
      { code: 'CARTA_PORTE', name: 'Carta Porte', category: 'operacional', is_mandatory: false, expiration_days: null, ai_prompt: 'Extrae numero, remitente, destinatario, descripcion de mercancia y condiciones' },
      { code: 'CERT_FUMIGACION', name: 'Certificado de Fumigacion', category: 'seguridad', is_mandatory: false, expiration_days: 180, ai_prompt: 'Extrae fecha de fumigacion, empresa certificadora, productos usados y fecha vencimiento' },
      { code: 'PLAN_EMERGENCIA', name: 'Plan de Emergencia', category: 'seguridad', is_mandatory: false, expiration_days: 365, ai_prompt: 'Extrae fecha de vigencia, responsable, procedimientos principales y contactos de emergencia' },
      { code: 'CERT_CAPACITACION', name: 'Certificado de Capacitacion', category: 'conductor', is_mandatory: false, expiration_days: 365, ai_prompt: 'Extrae nombre del curso, fecha, horas, institucion y nombre del participante' },
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

    // 3. Create demo transportista
    logs.push('Creando transportista demo...')
    const { error: orgError } = await supabase
      .from('transportistas')
      .upsert([
        { 
          razon_social: 'Transportes Demo SpA', 
          rut: '76.123.456-7', 
          direccion: 'Av. Principal 123',
          ciudad: 'Santiago',
          telefono: '+56 2 1234 5678',
          email: 'contacto@transportesdemo.cl',
          is_active: true
        }
      ], { onConflict: 'rut' })

    if (orgError) {
      if (orgError.message.includes('does not exist')) {
        logs.push('Tabla transportistas no existe')
      } else {
        logs.push(`Error creando transportista demo: ${orgError.message}`)
      }
    } else {
      logs.push('Transportista demo creado')
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
