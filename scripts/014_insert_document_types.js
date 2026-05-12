#!/usr/bin/env node

/**
 * Script to insert subcontractor document types into Supabase
 * Usage: node scripts/014_insert_document_types.js
 */

const { createClient } = require('@supabase/supabase-js');

async function insertDocumentTypes() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const documentTypes = [
    { code: 'AFP', nombre: 'AFP', descripcion: 'Afiliación y cotizaciones AFP', periodicidad: 'Mensual', es_obligatorio: true },
    { code: 'SALUD', nombre: 'Salud', descripcion: 'Certificado de afiliación a FONASA o Isapre', periodicidad: 'Trimestral', es_obligatorio: true },
    { code: 'MUTUAL', nombre: 'Mutual', descripcion: 'Certificado de afiliación a mutual', periodicidad: 'Trimestral', es_obligatorio: true },
    { code: 'F23', nombre: 'Formulario F23', descripcion: 'Declaración de impuesto a la renta', periodicidad: 'Anual', es_obligatorio: true },
    { code: 'F30', nombre: 'F30', descripcion: 'Certificado de afiliación tributaria', periodicidad: 'Anual', es_obligatorio: true },
    { code: 'F30_DOÑA_ISIDORA', nombre: 'F30-I Doña Isidora', descripcion: 'F30 Emitido a Doña Isidora', periodicidad: 'Anual', es_obligatorio: true },
    { code: 'F30_CLIENTE', nombre: 'F30-I Emitido a Cliente', descripcion: 'F30 Emitido a cliente', periodicidad: 'Anual', es_obligatorio: true },
    { code: 'LIQUIDACION_SUELDO', nombre: 'Liquidación de Sueldo', descripcion: 'Última liquidación de sueldo', periodicidad: 'Mensual', es_obligatorio: true },
    { code: 'COMPROBANTE_PAGO', nombre: 'Comprobante de Pago', descripcion: 'Comprobante de pago de impuestos', periodicidad: 'Mensual', es_obligatorio: true },
    { code: 'CERT_AFIL_MUTUAL', nombre: 'Cert. Afil Mutual', descripcion: 'Certificado de afiliación a mutual', periodicidad: 'Trimestral', es_obligatorio: false },
    { code: 'CERT_TASAS_MUTUAL', nombre: 'Cert. Tasas Mutual', descripcion: 'Certificado de tasas de afiliación mutual', periodicidad: 'Trimestral', es_obligatorio: false },
    { code: 'CERT_ANTECEDENTES', nombre: 'Cert. Antecedentes', descripcion: 'Certificado de antecedentes', periodicidad: 'Anual', es_obligatorio: true },
    { code: 'HOJA_VIDA', nombre: 'Hoja de Vida', descripcion: 'Hoja de vida del conductor', periodicidad: 'Anual', es_obligatorio: true },
    { code: 'FOTO_PATENTES', nombre: 'Foto Estado Patentes', descripcion: 'Fotografía del estado de las patentes', periodicidad: 'Mensual', es_obligatorio: true }
  ];

  console.log('[v0] Inserting document types...');
  
  const { data, error } = await supabase
    .from('subcontractor_document_types')
    .insert(documentTypes)
    .select();

  if (error) {
    if (error.message.includes('duplicate')) {
      console.log('[v0] Document types already exist (duplicate key constraint)');
      return;
    }
    console.error('[v0] Error inserting document types:', error.message);
    process.exit(1);
  } else {
    console.log('[v0] Successfully inserted', data.length, 'document types');
    data.forEach(d => console.log('[v0] ✓', d.nombre, `(${d.periodicidad})`));
  }
}

insertDocumentTypes();
