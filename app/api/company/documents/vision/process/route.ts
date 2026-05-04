import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get all documents with pending vision status
    const { data: documents, error } = await supabase
      .from("uploaded_documents")
      .select("id")
      .eq("vision_status", "pending")
      .limit(10)

    if (error) {
      throw error
    }

    console.log(`[v0] Found ${documents?.length || 0} documents to process`)

    // Process each document
    const results = []
    for (const doc of documents || []) {
      try {
        const visionResponse = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/company/documents/${doc.id}/vision`,
          {
            method: "POST",
          }
        )

        if (visionResponse.ok) {
          results.push({ documentId: doc.id, status: "success" })
        } else {
          results.push({ documentId: doc.id, status: "failed" })
        }
      } catch (err) {
        console.error(`[v0] Error processing document ${doc.id}:`, err)
        results.push({ documentId: doc.id, status: "error" })
      }
    }

    return NextResponse.json({ processed: results.length, results })
  } catch (error) {
    console.error("[v0] Batch processing error:", error)
    return NextResponse.json(
      { error: "Batch processing failed" },
      { status: 500 }
    )
  }
}
