/**
 * Document Auto-Detection System
 * Automatically identifies document type from image analysis
 */

import { DOCUMENT_TYPES, DocumentTypeConfig } from './document-types'

export interface DetectionResult {
  documentCode: string
  documentName: string
  confidence: number
  alternativeSuggestions: Array<{
    code: string
    name: string
    confidence: number
  }>
  detectionReasoning: string
}

/**
 * Main detection prompt for Claude/OpenAI to identify document type
 * This runs BEFORE the specific extraction prompt
 */
export const DOCUMENT_DETECTION_PROMPT = `Eres un experto en documentos chilenos de transporte. 

Tu tarea es identificar qué tipo de documento es esta imagen.

CATEGORÍAS DISPONIBLES:
1. EMPRESA: RUT Empresa, Escritura Constitución, Certificado Vigencia, Poder Representante, Cédula Representante
2. CONDUCTOR: Cédula Identidad, Licencia Conducir, Hoja Vida, Antecedentes, Licencia, Contrato, AFP, Salud, Examen
3. VEHÍCULO: Padrón, Permiso Circulación, Revisión Técnica, Emisiones, Seguro SOAP, Seguro Carga, Responsabilidad, Foto
4. SEGURIDAD: Reglamento, Procedimientos, Matriz Riesgos, Capacitaciones, Protocolos
5. OPERACIONAL: Guía Despacho, Orden Transporte, Carta Porte, Documentos Carga, Registro Entrega
6. SUBCONTRATACIÓN: Contratos, F-30-1, Cumplimiento Previsional

ANALIZA LA IMAGEN Y:
1. Identifica el tipo de documento principal
2. Proporciona 2-3 alternativas si hay incertidumbre
3. Explica brevemente por qué es ese documento

RESPONDE EN JSON CON ESTA ESTRUCTURA:
{
  "primaryDocument": {
    "code": "CODIGO-DOCUMENTO",
    "name": "Nombre del Documento",
    "confidence": 0.95,
    "reasoning": "Razón de identificación"
  },
  "alternatives": [
    {
      "code": "CODIGO-ALTERNATIVO",
      "name": "Nombre Alternativo",
      "confidence": 0.60
    }
  ]
}

Sé preciso y confiable. Si no puedes identificar el documento, devuelve confidence: 0.0`

/**
 * Keywords and patterns for each document type
 * Used for local quick detection before sending to AI
 */
export const DOCUMENT_KEYWORDS: Record<string, string[]> = {
  'RUT-EMPRESA': ['RUT', 'empresa', 'razón social', 'SII', 'contribuyente'],
  'CEDULA-IDENTIDAD': ['Cédula', 'identidad', 'RUT', 'chilena', 'fecha nacimiento'],
  'LICENCIA-CONDUCIR': ['Licencia', 'conducir', 'A-4', 'A-5', 'profesional', 'clase'],
  'PADRON-INSCRIPCION': ['Padrón', 'inscripción', 'vehículo', 'patente', 'VIN', 'motor'],
  'PERMISO-CIRCULACION': ['Permiso', 'circulación', 'patente', 'municipio', 'vigencia'],
  'REVISION-TECNICA': ['Revisión técnica', 'RT', 'apto', 'inspección técnica', 'patente'],
  'SEGURO-SOAP': ['SOAP', 'seguro obligatorio', 'pasajeros', 'patente'],
  'GUIA-DESPACHO': ['Guía despacho', 'GD', 'emisor', 'receptor', 'transportista'],
  'CERTIFICADO-ANTECEDENTES': ['Antecedentes', 'PDI', 'Carabineros', 'penales'],
  'CONTRATO-TRABAJO': ['Contrato', 'trabajo', 'empresa', 'empleado', 'remuneración'],
  'CERTIFICADO-AFP': ['AFP', 'afiliación', 'pensiones', 'cotización'],
  'F30-1': ['F-30-1', 'F30-1', 'transporte carga', 'capacidad', 'certificado'],
}

/**
 * OCR-based quick detection using text extraction
 * Fast local detection before AI
 */
export function quickDetectByKeywords(extractedText: string): DetectionResult | null {
  const textLower = extractedText.toLowerCase()

  // Score each document type
  const scores: Record<string, number> = {}

  Object.entries(DOCUMENT_KEYWORDS).forEach(([docCode, keywords]) => {
    let score = 0
    keywords.forEach((keyword) => {
      if (textLower.includes(keyword.toLowerCase())) {
        score += 1
      }
    })
    if (score > 0) {
      scores[docCode] = score
    }
  })

  if (Object.keys(scores).length === 0) {
    return null
  }

  // Sort by score
  const sorted = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  const primary = sorted[0]
  const primaryDoc = DOCUMENT_TYPES[primary[0]]

  if (!primaryDoc) {
    return null
  }

  return {
    documentCode: primary[0],
    documentName: primaryDoc.name,
    confidence: Math.min(0.7, (primary[1] / 3) * 0.8), // Cap at 0.7 for quick detection
    alternativeSuggestions: sorted.slice(1).map(([code, score]) => ({
      code,
      name: DOCUMENT_TYPES[code]?.name || code,
      confidence: (score / 3) * 0.6,
    })),
    detectionReasoning: `Detected by keyword matching: ${primary[1]} keywords found`,
  }
}

/**
 * AI-powered document detection using Claude/OpenAI
 * More accurate but slower
 */
export async function detectDocumentTypeViaAI(
  base64Image: string,
  options?: {
    model?: string
    quickOnly?: boolean
  }
): Promise<DetectionResult> {
  const model = options?.model || 'claude-3-5-sonnet-20241022'

  try {
    // Call Claude API with vision
    const response = await fetch('/api/detect-document-type', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: base64Image,
        model,
        prompt: DOCUMENT_DETECTION_PROMPT,
      }),
    })

    if (!response.ok) {
      throw new Error(`Detection API error: ${response.statusText}`)
    }

    const data = await response.json()

    const primary = data.primaryDocument
    const primaryDoc = DOCUMENT_TYPES[primary.code]

    if (!primaryDoc) {
      throw new Error(`Document type not found: ${primary.code}`)
    }

    return {
      documentCode: primary.code,
      documentName: primaryDoc.name,
      confidence: primary.confidence,
      alternativeSuggestions: (data.alternatives || []).map((alt: any) => ({
        code: alt.code,
        name: DOCUMENT_TYPES[alt.code]?.name || alt.name,
        confidence: alt.confidence,
      })),
      detectionReasoning: primary.reasoning,
    }
  } catch (error) {
    console.error('[v0] Document detection error:', error)
    throw error
  }
}

/**
 * Two-stage detection: Quick keywords first, then AI if uncertain
 */
export async function detectDocumentTypeHybrid(
  base64Image: string,
  extractedText?: string
): Promise<DetectionResult> {
  // Stage 1: Quick keyword detection if text available
  if (extractedText) {
    const quickResult = quickDetectByKeywords(extractedText)
    if (quickResult && quickResult.confidence > 0.75) {
      console.log('[v0] Quick detection confident:', quickResult.documentCode)
      return quickResult
    }
  }

  // Stage 2: AI detection
  console.log('[v0] Quick detection uncertain, using AI detection')
  return detectDocumentTypeViaAI(base64Image)
}

/**
 * Validate detected document type matches extracted data
 */
export function validateDetectionConsistency(
  detectedCode: string,
  extractedData: Record<string, any>
): { isConsistent: boolean; score: number; issues: string[] } {
  const docType = DOCUMENT_TYPES[detectedCode]
  if (!docType) {
    return { isConsistent: false, score: 0, issues: ['Document type not found'] }
  }

  const issues: string[] = []
  let matchedFields = 0

  // Check if extracted data contains required fields
  docType.requiredFields.forEach((field) => {
    if (extractedData[field]) {
      matchedFields++
    } else {
      issues.push(`Missing required field: ${field}`)
    }
  })

  const score = matchedFields / docType.requiredFields.length
  const isConsistent = score >= 0.7

  return { isConsistent, score, issues }
}

/**
 * Get recommended extraction prompt for detected document type
 */
export function getExtractionPrompt(documentCode: string): string {
  const docType = DOCUMENT_TYPES[documentCode]
  if (!docType) {
    throw new Error(`Document type not found: ${documentCode}`)
  }
  return docType.aiPrompt
}
