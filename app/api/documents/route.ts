import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'development') console.log("[v0] API: Starting document save to Supabase...")

    const supabase = await createClient()
    const body = await request.json()

    if (process.env.NODE_ENV === 'development') console.log("[v0] API: Received document data:", body)

    const { documents } = body

    if (!documents || !Array.isArray(documents)) {
      return NextResponse.json({ error: "Invalid documents data" }, { status: 400 })
    }

    const savedDocuments = []

    for (const doc of documents) {
      // Get conductor_id from form data (use RUT as reference to find conductor)
      const conductorRut = doc.formData?.transporterRut || null
      
      if (!conductorRut) {
        console.error("[v0] API: No conductor RUT provided")
        continue
      }

      // Find the conductor by RUT
      const { data: conductors, error: conductorError } = await supabase
        .from("conductores")
        .select("id, rut")
        .eq("rut", conductorRut)
        .single()

      if (conductorError || !conductors) {
        console.error("[v0] API: Error finding conductor:", conductorError)
        continue
      }

      // Save to uploaded_documents table with proper structure
      const { data: documentData, error: documentError } = await supabase
        .from("uploaded_documents")
        .insert({
          conductor_id: conductors.id,
          file_name: doc.fileName,
          file_size: doc.fileSize,
          file_type: doc.fileType,
          document_type: doc.documentType,
          upload_date: doc.uploadDate,
          validation_status: 'pending',
          created_at: new Date().toISOString(),
          metadata: {
            ocr_data: doc.ocrData || {},
            confidence: doc.confidence || 'low',
            form_data: doc.formData || {}
          }
        })
        .select()
        .single()

      if (documentError) {
        console.error("[v0] API: Error saving document to uploaded_documents:", documentError)
        return NextResponse.json({ 
          success: false,
          error: `Error al guardar documento: ${documentError.message}` 
        }, { status: 400 })
      }

      if (process.env.NODE_ENV === 'development') console.log("[v0] API: Document saved successfully:", documentData)
      savedDocuments.push(documentData)
    }

    if (process.env.NODE_ENV === 'development') console.log("[v0] API: All documents processed successfully")

    return NextResponse.json({
      success: true,
      message: `${savedDocuments.length} documentos guardados exitosamente`,
      documents: savedDocuments,
    })
  } catch (error) {
    console.error("[v0] API: Error in document save:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") // 'transporters' or 'machines'

    if (type === "transporters") {
      const { data, error } = await supabase
        .from("transporters")
        .select(`
          *,
          documents (*)
        `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("[v0] API: Error fetching transporters:", error)
        return NextResponse.json({ error: "Error fetching transporters" }, { status: 500 })
      }

      return NextResponse.json({ success: true, data })
    } else if (type === "machines") {
      const { data, error } = await supabase
        .from("machines")
        .select(`
          *,
          documents (*)
        `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("[v0] API: Error fetching machines:", error)
        return NextResponse.json({ error: "Error fetching machines" }, { status: 500 })
      }

      return NextResponse.json({ success: true, data })
    } else {
      // Get all documents
      const { data, error } = await supabase.from("documents").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("[v0] API: Error fetching documents:", error)
        return NextResponse.json({ error: "Error fetching documents" }, { status: 500 })
      }

      return NextResponse.json({ success: true, data })
    }
  } catch (error) {
    console.error("[v0] API: Error in document fetch:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
