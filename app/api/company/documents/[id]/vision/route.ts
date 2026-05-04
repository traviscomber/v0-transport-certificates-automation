import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = params.id
    console.log("[v0] Processing document with vision:", documentId)

    // Get document from database
    const supabase = await createClient()
    const { data: document, error: docError } = await supabase
      .from("uploaded_documents")
      .select("*")
      .eq("id", documentId)
      .single()

    if (docError || !document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      )
    }

    if (!document.file_url) {
      return NextResponse.json(
        { error: "Document has no file URL" },
        { status: 400 }
      )
    }

    // Mark as processing
    await supabase
      .from("uploaded_documents")
      .update({ vision_status: "processing" })
      .eq("id", documentId)

    // Get file from URL and convert to base64
    const response = await fetch(document.file_url)
    const buffer = await response.arrayBuffer()
    const base64 = Buffer.from(buffer).toString("base64")

    // Determine media type
    const fileExtension = document.original_filename?.split(".").pop()?.toLowerCase()
    let mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp" = "image/jpeg"
    if (fileExtension === "png") mediaType = "image/png"
    else if (fileExtension === "gif") mediaType = "image/gif"
    else if (fileExtension === "webp") mediaType = "image/webp"

    // Call GPT-4 Vision with best configuration
    const visionResponse = await openai.messages.create({
      model: "gpt-4-vision-preview",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64,
              },
            },
            {
              type: "text",
              text: `Analiza este documento de transporte y extrae la siguiente información en formato JSON:
{
  "document_type": "tipo del documento (cédula, licencia, contrato, comprobante, etc)",
  "document_number": "número de documento si aplica",
  "person_name": "nombre de la persona",
  "person_rut": "RUT de la persona si aplica",
  "validity_date": "fecha de validez/vencimiento si aplica",
  "company_name": "nombre de la empresa si aplica",
  "key_data": {
    "campo1": "valor1",
    "campo2": "valor2"
  },
  "is_readable": true/false,
  "quality_issues": ["lista de problemas de calidad"],
  "anomalies": ["lista de anomalías detectadas"],
  "extracted_text": "texto completo extraído del documento"
}

Sé preciso y detallado. Si algo no está claro, indícalo en quality_issues.`,
            },
          ],
        },
      ],
    })

    // Parse response
    const content = visionResponse.content[0]
    if (content.type !== "text") {
      throw new Error("Unexpected response type from vision API")
    }

    // Extract JSON from response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Could not extract JSON from vision response")
    }

    const visionData = JSON.parse(jsonMatch[0])

    // Update document with vision results
    const updateData: Record<string, any> = {
      vision_status: "completed",
      document_type: visionData.document_type,
      extracted_data: visionData.key_data || {},
      ocr_text: visionData.extracted_text,
      anomalies_detected: visionData.anomalies || [],
      vision_processed_at: new Date().toISOString(),
      validation_result: {
        is_readable: visionData.is_readable,
        quality_issues: visionData.quality_issues,
      },
    }

    const { error: updateError } = await supabase
      .from("uploaded_documents")
      .update(updateData)
      .eq("id", documentId)

    if (updateError) {
      throw updateError
    }

    console.log("[v0] Document processed successfully:", documentId)

    return NextResponse.json({
      success: true,
      documentId,
      visionData,
    })
  } catch (error) {
    console.error("[v0] Vision processing error:", error)

    // Update document with error status
    const supabase = await createClient()
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error"

    await supabase
      .from("uploaded_documents")
      .update({
        vision_status: "error",
        vision_error: errorMessage,
      })
      .eq("id", params.id)

    return NextResponse.json(
      { error: "Vision processing failed", details: errorMessage },
      { status: 500 }
    )
  }
}
