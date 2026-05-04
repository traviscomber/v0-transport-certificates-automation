import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import {
  validateChileanRUT,
  validateChileanLicensePlate,
  validateExpirationDate,
  validateLicenseClass,
  detectCommonAnomalies,
  calculateConfidenceScore,
} from "@/lib/validators/chilean-documents"

export const dynamic = "force-dynamic"
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const { documentId } = await request.json()

    if (!documentId) {
      return NextResponse.json({ error: "documentId is required" }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 500 })
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const supabase = await createClient()

    // Get document
    const { data: document, error: docError } = await supabase
      .from("uploaded_documents")
      .select("*")
      .eq("id", documentId)
      .single()

    if (docError || !document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    if (!document.file_url) {
      return NextResponse.json({ error: "Document has no file URL" }, { status: 400 })
    }

    // Mark as processing
    await supabase
      .from("uploaded_documents")
      .update({ vision_status: "processing" })
      .eq("id", documentId)

    // Call GPT-4o Vision - best model for document analysis
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 4096,
      temperature: 0.1,
      messages: [
        {
          role: "system",
          content: `Eres un experto analizador de documentos de transporte chilenos. Tu tarea es:
1. Identificar el tipo de documento (cédula de identidad, licencia de conducir, contrato, certificado, etc)
2. Extraer TODO el texto visible (OCR completo)
3. Identificar fechas importantes especialmente fechas de vencimiento
4. Detectar anomalías o problemas con el documento
5. Validar si el documento parece auténtico y legible

Responde SIEMPRE en JSON válido.`
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: document.file_url,
                detail: "high"
              }
            },
            {
              type: "text",
              text: `Analiza este documento y extrae la información en el siguiente formato JSON:
{
  "document_type": "tipo de documento identificado",
  "person_name": "nombre completo si aparece",
  "person_rut": "RUT si aparece (formato XX.XXX.XXX-X)",
  "dates": {
    "issue_date": "fecha de emisión si aparece (YYYY-MM-DD)",
    "expiry_date": "fecha de vencimiento si aparece (YYYY-MM-DD)",
    "other_dates": ["otras fechas relevantes"]
  },
  "is_expired": true/false basado en fecha actual,
  "days_until_expiry": número de días hasta vencimiento (negativo si ya venció),
  "ocr_text": "TODO el texto visible en el documento, línea por línea",
  "key_data": {
    "campo1": "valor1",
    "campo2": "valor2"
  },
  "validation": {
    "is_readable": true/false,
    "is_complete": true/false,
    "quality_score": 1-10,
    "issues": ["lista de problemas encontrados"]
  },
  "anomalies": ["lista de anomalías detectadas si las hay"],
  "confidence": 0.0-1.0
}`
            }
          ]
        }
      ]
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error("No response from vision API")
    }

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Could not parse JSON from response")
    }

    const visionData = JSON.parse(jsonMatch[0])

    // Apply Chilean document validators
    let additionalAnomalies: string[] = [...(visionData.anomalies || [])]
    let documentQuality: "high" | "medium" | "low" = "high"

    // Validate RUT if present
    if (visionData.person_rut) {
      const rutValidation = validateChileanRUT(visionData.person_rut)
      if (!rutValidation.valid) {
        additionalAnomalies.push(`❌ ${rutValidation.error}`)
        documentQuality = "medium"
      }
    }

    // Validate license plate if present
    if (visionData.key_data?.patente || visionData.key_data?.license_plate) {
      const plate = visionData.key_data.patente || visionData.key_data.license_plate
      const plateValidation = validateChileanLicensePlate(plate)
      if (!plateValidation.valid) {
        additionalAnomalies.push(`❌ ${plateValidation.error}`)
      }
    }

    // Validate expiration date if present
    if (visionData.dates?.expiry_date) {
      const dateValidation = validateExpirationDate(visionData.dates.expiry_date)
      if (!dateValidation.valid) {
        additionalAnomalies.push(`⚠️ ${dateValidation.error}`)
        documentQuality = "low"
      } else if (
        dateValidation.daysUntilExpiration !== undefined &&
        dateValidation.daysUntilExpiration < 30
      ) {
        additionalAnomalies.push(`⚠️ Próximo a vencer en ${dateValidation.daysUntilExpiration} días`)
      }
    }

    // Validate license classes if present
    if (visionData.key_data?.license_classes) {
      const classes = Array.isArray(visionData.key_data.license_classes)
        ? visionData.key_data.license_classes
        : [visionData.key_data.license_classes]

      for (const cls of classes) {
        const classValidation = validateLicenseClass(cls)
        if (!classValidation.valid) {
          additionalAnomalies.push(`❌ ${classValidation.error}`)
        }
      }
    }

    // Calculate confidence score based on anomalies and quality
    const { score: confidenceScore, level: confidenceLevel } = calculateConfidenceScore(
      additionalAnomalies,
      documentQuality
    )

    // Update document with vision results
    const { error: updateError } = await supabase
      .from("uploaded_documents")
      .update({
        vision_status: "completed",
        document_type: visionData.document_type || null,
        extracted_data: {
          person_name: visionData.person_name,
          person_rut: visionData.person_rut,
          dates: visionData.dates,
          is_expired: visionData.is_expired,
          days_until_expiry: visionData.days_until_expiry,
          key_data: visionData.key_data,
          confidence: visionData.confidence,
          confidence_score: confidenceScore,
          confidence_level: confidenceLevel,
          document_quality: documentQuality,
        },
        validation_result: {
          ...visionData.validation,
          additional_validators_applied: true,
          confidence_score: confidenceScore,
          confidence_level: confidenceLevel,
        },
        anomalies_detected: additionalAnomalies,
        ocr_text: visionData.ocr_text,
        vision_processed_at: new Date().toISOString(),
        vision_error: null
      })
      .eq("id", documentId)

    if (updateError) {
      throw new Error(`Failed to update document: ${updateError.message}`)
    }

    return NextResponse.json({
      success: true,
      documentId,
      result: visionData
    })

  } catch (error: any) {
    // Update document with error
    if (error.message !== "documentId is required" && error.message !== "Document not found") {
      const supabase = await createClient()
      const { documentId } = await request.json().catch(() => ({}))
      if (documentId) {
        await supabase
          .from("uploaded_documents")
          .update({
            vision_status: "error",
            vision_error: error.message
          })
          .eq("id", documentId)
      }
    }

    return NextResponse.json(
      { error: error.message || "Vision processing failed" },
      { status: 500 }
    )
  }
}
