import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { documentId } = await request.json()

    if (!documentId) {
      return NextResponse.json(
        { error: "documentId is required" },
        { status: 400 }
      )
    }

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

    // Call GPT-4 Vision with the file URL directly
    const visionResponse = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      max_tokens: 4096,
      temperature: 0.2,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: document.file_url,
                detail: "high",
              },
            },
            {
              type: "text",
              text: `Analiza este documento de transporte y extrae en JSON:
{
  "document_type": "tipo documento",
  "person_name": "nombre",
  "person_rut": "RUT",
  "is_readable": true/false,
  "quality_issues": [],
  "anomalies": [],
  "extracted_text": "texto completo"
}`,
            },
          ],
        },
      ],
    })

    const content = visionResponse.choices[0]?.message?.content
    if (!content || typeof content !== "string") {
      throw new Error("Invalid vision response")
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("No JSON found in response")
    }

    const visionData = JSON.parse(jsonMatch[0])

    // Update document
    await supabase
      .from("uploaded_documents")
      .update({
        vision_status: "completed",
        document_type: visionData.document_type,
        extracted_data: visionData,
        validation_result: {
          is_readable: visionData.is_readable,
          quality_issues: visionData.quality_issues || [],
        },
        anomalies_detected: visionData.anomalies || [],
        ocr_text: visionData.extracted_text,
        vision_processed_at: new Date().toISOString(),
      })
      .eq("id", documentId)

    return NextResponse.json({
      success: true,
      documentId,
      visionData,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
