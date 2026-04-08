#!/usr/bin/env node

/**
 * Script para procesar documentos descargados
 * - Valida archivos
 * - Optimiza imágenes
 * - Agrega watermarks
 * - Documenta metadatos
 */

const fs = require('fs')
const path = require('path')

const DOWNLOAD_DIR = path.join(__dirname, '..', 'temp_downloads')
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'document-examples')
const METADATA_FILE = path.join(OUTPUT_DIR, 'DOCUMENTOS_METADATA.json')

console.log('[*] Iniciando procesamiento de documentos...\n')

// Crear directorio de salida si no existe
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

// Mapeo de documentos con metadatos
const documentosMetadata = {
  '01-licencia-conduccion-a4': {
    nombre: 'Licencia de Conducir Clase A4',
    categoria: 'Conductor',
    descripcion: 'Licencia de conducción para vehículos livianos',
    fuente: 'CONASET',
    url_fuente: 'https://www.conaset.cl',
    requisitos: ['RUT', 'Fecha vencimiento', 'Clases de vehículos'],
    obligatorio: true
  },
  '02-rtv-revision-tecnica': {
    nombre: 'RTV - Revisión Técnica de Vehículos',
    categoria: 'Vehículo',
    descripcion: 'Certificado de aprobación de revisión técnica',
    fuente: 'Revicentro.cl / Plantas RTV',
    url_fuente: 'https://www.revicentro.cl',
    requisitos: ['Patente', 'Fecha vencimiento', 'Estado aprobado'],
    obligatorio: true
  },
  '03-tarjeta-circulacion': {
    nombre: 'Tarjeta de Circulación',
    categoria: 'Vehículo',
    descripcion: 'Documento verde de propiedad y circulación del vehículo',
    fuente: 'MTT',
    url_fuente: 'https://www.mtt.gob.cl',
    requisitos: ['RUT propietario', 'Patente', 'Marca/Modelo'],
    obligatorio: true
  },
  '04-rut-certificate': {
    nombre: 'Certificado de RUT',
    categoria: 'Empresa/Persona',
    descripcion: 'e-RUT certificado emitido por SII',
    fuente: 'SII',
    url_fuente: 'https://www.sii.cl',
    requisitos: ['RUT en formato XX.XXX.XXX-K', 'Nombre', 'Actividad'],
    obligatorio: true
  },
  '05-seguro-rc': {
    nombre: 'Seguro de Responsabilidad Civil',
    categoria: 'Vehículo',
    descripcion: 'Póliza de seguro RC obligatoria',
    fuente: 'Empresa Aseguradora',
    url_fuente: 'Varía por aseguradora',
    requisitos: ['Patente', 'Vigencia', 'Monto cobertura'],
    obligatorio: true
  },
  '06-permiso-circulacion': {
    nombre: 'Permiso de Circulación Mensual',
    categoria: 'Vehículo',
    descripcion: 'Sticker mensual de circulación',
    fuente: 'MTT',
    url_fuente: 'https://www.mtt.gob.cl',
    requisitos: ['Mes/Año vigente', 'Patente', 'Número serie'],
    obligatorio: true
  },
  '07-ley-20123-capacitacion': {
    nombre: 'Capacitación Ley 20.123',
    categoria: 'Empresa',
    descripcion: 'Certificado de cumplimiento Ley 20.123',
    fuente: 'Instituciones Autorizadas',
    url_fuente: 'https://www.dt.gob.cl',
    requisitos: ['Certificado completado', 'Fecha vigencia'],
    obligatorio: true
  },
  '08-adr-certificate': {
    nombre: 'Certificado ADR',
    categoria: 'Transporte Especial',
    descripcion: 'Autorización para transporte de carga peligrosa',
    fuente: 'Escuelas de Conducción Certificadas',
    url_fuente: 'https://www.mtt.gob.cl',
    requisitos: ['Clases de mercancías', 'Vigencia'],
    obligatorio: false
  }
}

// Guardar metadatos
const metadataOutput = {
  generado_en: new Date().toISOString(),
  total_documentos: Object.keys(documentosMetadata).length,
  documentos: documentosMetadata,
  instrucciones: {
    paso1: 'Ejecutar: bash scripts/download-chilean-documents.sh',
    paso2: 'Convertir PDFs a JPG (usar ImageMagick, Ghostscript o similares)',
    paso3: 'Guardar JPGs en: public/document-examples/',
    paso4: 'Ejecutar este script: node scripts/process-documents.js'
  }
}

fs.writeFileSync(METADATA_FILE, JSON.stringify(metadataOutput, null, 2))

console.log('[✓] Metadatos guardados en: ' + METADATA_FILE)
console.log('\n=== DOCUMENTOS CONFIGURADOS ===\n')

Object.entries(documentosMetadata).forEach(([id, meta]) => {
  console.log(`[${meta.obligatorio ? 'OBLIGATORIO' : 'OPCIONAL'}] ${meta.nombre}`)
  console.log(`  Categoría: ${meta.categoria}`)
  console.log(`  Fuente: ${meta.fuente}`)
  console.log(`  URL: ${meta.url_fuente}`)
  console.log(`  Requisitos: ${meta.requisitos.join(', ')}`)
  console.log('')
})

console.log('=== INSTRUCCIONES SIGUIENTES ===\n')
console.log('1. Descargar documentos:')
console.log('   bash scripts/download-chilean-documents.sh\n')
console.log('2. Convertir PDFs a JPG (instalar ImageMagick):')
console.log('   sudo apt-get install imagemagick  # Linux')
console.log('   brew install imagemagick          # macOS')
console.log('   Luego: convert temp_downloads/*.pdf -quality 85 public/document-examples/\n')
console.log('3. Copiar archivos convertidos al directorio de salida\n')
console.log('4. Agregar watermark (siguiente paso)\n')
