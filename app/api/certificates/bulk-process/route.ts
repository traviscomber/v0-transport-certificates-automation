import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Prevent static generation - this route must run at request time
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user and verify admin role
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()

    if (profileError || !profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Get all pending certificates
    const { data: pendingCertificates, error: fetchError } = await supabase
      .from("certificates")
      .select("*")
      .eq("status", "pending")
      .limit(50) // Process in batches

    if (fetchError) {
      return NextResponse.json({ error: "Failed to fetch certificates" }, { status: 500 })
    }

    const results = []

    // Process each certificate
    for (const certificate of pendingCertificates || []) {
      try {
        const processingResult = await processCertificateBasic(certificate)

        // Update certificate
        await supabase
          .from("certificates")
          .update({
            status: processingResult.isValid ? "approved" : "rejected",
            validation_notes: processingResult.notes,
            validated_by: user.id,
            validated_at: new Date().toISOString(),
          })
          .eq("id", certificate.id)

        // Create notification
        await supabase.from("notifications").insert({
          user_id: certificate.driver_id,
          title: processingResult.isValid ? "Certificado Procesado - Aprobado" : "Certificado Procesado - Rechazado",
          message: processingResult.isValid
            ? "Tu certificado ha sido procesado automáticamente y aprobado."
            : `Tu certificado ha sido procesado pero requiere correcciones: ${processingResult.notes}`,
          type: processingResult.isValid ? "success" : "error",
          related_certificate_id: certificate.id,
        })

        results.push({
          certificateId: certificate.id,
          success: true,
          result: processingResult,
        })
      } catch (error) {
        results.push({
          certificateId: certificate.id,
          success: false,
          error: error instanceof Error ? error.message : "Processing failed",
        })
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    })
  } catch (error) {
    console.error("Bulk processing error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function processCertificateBasic(certificate: any) {
  let isValid = true
  const notes = []
  let complianceScore = 100
  let riskLevel = "low"

  // Basic validation logic (same as in individual processing)
  if (!certificate.certificate_number) {
    isValid = false
    notes.push("Número de certificado requerido")
    complianceScore -= 20
  }

  if (!certificate.issue_date) {
    isValid = false
    notes.push("Fecha de emisión requerida")
    complianceScore -= 15
  }

  if (!certificate.expiry_date) {
    isValid = false
    notes.push("Fecha de vencimiento requerida")
    complianceScore -= 15
  }

  if (certificate.issue_date && certificate.expiry_date) {
    const issueDate = new Date(certificate.issue_date)
    const expiryDate = new Date(certificate.expiry_date)
    const today = new Date()

    if (expiryDate < today) {
      isValid = false
      notes.push("Certificado vencido")
      complianceScore -= 30
      riskLevel = "high"
    }
  }

  if (complianceScore < 70) {
    riskLevel = "high"
  } else if (complianceScore < 85) {
    riskLevel = "medium"
  }

  return {
    isValid,
    complianceScore: Math.max(0, complianceScore),
    notes: notes.join("; ") || "Certificado válido",
    riskLevel,
  }
}
