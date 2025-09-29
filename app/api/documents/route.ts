import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] API: Starting document save to Supabase...")

    const supabase = await createClient()
    const body = await request.json()

    console.log("[v0] API: Received document data:", body)

    const { documents } = body

    if (!documents || !Array.isArray(documents)) {
      return NextResponse.json({ error: "Invalid documents data" }, { status: 400 })
    }

    const savedDocuments = []

    for (const doc of documents) {
      // First, save the document
      const { data: documentData, error: documentError } = await supabase
        .from("documents")
        .insert({
          file_name: doc.fileName,
          file_size: doc.fileSize,
          file_type: doc.fileType,
          document_type: doc.documentType,
          upload_date: doc.uploadDate,
          ocr_data: doc.ocrData || {},
        })
        .select()
        .single()

      if (documentError) {
        console.error("[v0] API: Error saving document:", documentError)
        continue
      }

      console.log("[v0] API: Document saved:", documentData)

      // Then, save to appropriate table based on document type
      if (doc.documentType === "Licencia de Conducir") {
        // Save to transporters table
        const ocrData = doc.ocrData || {}
        const formData = doc.formData || {}

        const { data: transporterData, error: transporterError } = await supabase
          .from("transporters")
          .insert({
            document_id: documentData.id,
            rut: formData.transporterRut || ocrData.rutConductor || null,
            name: formData.transporterName || ocrData.nombreConductor || null,
            license_number: ocrData.numeroLicencia || null,
            license_class: ocrData.claseLicencia || null,
            issue_date: ocrData.fechaEmision ? new Date(ocrData.fechaEmision).toISOString().split("T")[0] : null,
            expiry_date: ocrData.fechaVencimiento
              ? new Date(ocrData.fechaVencimiento).toISOString().split("T")[0]
              : null,
            restrictions: ocrData.restricciones || null,
          })
          .select()
          .single()

        if (transporterError) {
          console.error("[v0] API: Error saving transporter:", transporterError)
        } else {
          console.log("[v0] API: Transporter saved:", transporterData)
        }
      } else {
        // Save to machines table for vehicle-related documents
        const ocrData = doc.ocrData || {}
        const formData = doc.formData || {}

        const { data: machineData, error: machineError } = await supabase
          .from("machines")
          .insert({
            document_id: documentData.id,
            patent: formData.vehiclePlate || ocrData.patenteVehiculo || ocrData.patente || null,
            transporter_name: formData.transporterName || ocrData.nombreTransportista || null,
            transporter_rut: formData.transporterRut || ocrData.rutTransportista || null,
            document_number: ocrData.numeroDocumento || null,
            issue_date: ocrData.fechaEmision ? new Date(ocrData.fechaEmision).toISOString().split("T")[0] : null,
            expiry_date: ocrData.fechaVencimiento
              ? new Date(ocrData.fechaVencimiento).toISOString().split("T")[0]
              : null,
          })
          .select()
          .single()

        if (machineError) {
          console.error("[v0] API: Error saving machine:", machineError)
        } else {
          console.log("[v0] API: Machine saved:", machineData)
        }
      }

      savedDocuments.push(documentData)
    }

    console.log("[v0] API: All documents processed successfully")

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
