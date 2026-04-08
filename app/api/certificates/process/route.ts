import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { certificateId } = await request.json()

    // Get certificate details
    const { data: certificate, error: certError } = await supabase
      .from("certificates")
      .select("*")
      .eq("id", certificateId)
      .single()

    if (certError || !certificate) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 })
    }

    // Simulate OCR processing and validation
    const processingResult = await processCertificate(certificate)

    // Update certificate with processing results
    const { error: updateError } = await supabase
      .from("certificates")
      .update({
        status: processingResult.isValid ? "approved" : "rejected",
        validation_notes: processingResult.notes,
        validated_by: user.id,
        validated_at: new Date().toISOString(),
      })
      .eq("id", certificateId)

    if (updateError) {
      return NextResponse.json({ error: "Failed to update certificate" }, { status: 500 })
    }

    // Create notification for driver
    await supabase.from("notifications").insert({
      user_id: certificate.driver_id,
      title: processingResult.isValid ? "Certificado Procesado - Aprobado" : "Certificado Procesado - Rechazado",
      message: processingResult.isValid
        ? "Tu certificado ha sido procesado automáticamente y aprobado."
        : `Tu certificado ha sido procesado pero requiere correcciones: ${processingResult.notes}`,
      type: processingResult.isValid ? "success" : "error",
      related_certificate_id: certificateId,
    })

    return NextResponse.json({
      success: true,
      result: processingResult,
    })
  } catch (error) {
    console.error("Certificate processing error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function processCertificate(certificate: any) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error("[v0] OPENAI_API_KEY not configured")
      return performBasicValidation(certificate)
    }

    // Use OpenAI Vision API directly with gpt-4o for certificate validation
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this Chilean transport certificate for validation:

Certificate Type: ${certificate.certificate_type}
Certificate Number: ${certificate.certificate_number || "Not provided"}
Issue Date: ${certificate.issue_date || "Not provided"}
Expiry Date: ${certificate.expiry_date || "Not provided"}
Issuing Authority: ${certificate.issuing_authority || "Not provided"}

Please validate this certificate based on Chilean transport regulations and provide:
1. Is this certificate valid? (true/false)
2. Compliance score (0-100)
3. Any validation notes or issues found
4. Risk level (low/medium/high)

Respond ONLY in JSON format: { "isValid": boolean, "complianceScore": number, "notes": string, "riskLevel": string }`
              }
            ]
          }
        ],
        max_tokens: 512
      })
    })

    if (!openaiResponse.ok) {
      console.error("[v0] OpenAI API error, falling back to basic validation")
      return performBasicValidation(certificate)
    }

    const responseData = await openaiResponse.json()
    const text = responseData.choices[0]?.message?.content || ""

    // Parse AI response
    let result
    try {
      result = JSON.parse(text)
    } catch {
      console.error("[v0] Failed to parse OpenAI response, using basic validation")
      result = performBasicValidation(certificate)
    }

    return result
  } catch (error) {
    console.error("[v0] Certificate processing error:", error)
    // Fallback to basic validation
    return performBasicValidation(certificate)
  }
}

function performBasicValidation(certificate: any) {
  let isValid = true
  const notes = []
  let complianceScore = 100
  let riskLevel = "low"

  // Check required fields
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

  if (!certificate.issuing_authority) {
    isValid = false
    notes.push("Autoridad emisora requerida")
    complianceScore -= 10
  }

  // Check date validity
  if (certificate.issue_date && certificate.expiry_date) {
    const issueDate = new Date(certificate.issue_date)
    const expiryDate = new Date(certificate.expiry_date)
    const today = new Date()

    if (issueDate > today) {
      isValid = false
      notes.push("Fecha de emisión no puede ser futura")
      complianceScore -= 25
      riskLevel = "high"
    }

    if (expiryDate < today) {
      isValid = false
      notes.push("Certificado vencido")
      complianceScore -= 30
      riskLevel = "high"
    }

    if (issueDate >= expiryDate) {
      isValid = false
      notes.push("Fecha de emisión debe ser anterior a la de vencimiento")
      complianceScore -= 20
      riskLevel = "medium"
    }
  }

  // Certificate type specific validation
  if (certificate.certificate_type === "f30") {
    if (!certificate.certificate_number?.startsWith("F30")) {
      notes.push("Número de certificado F-30 debe comenzar con 'F30'")
      complianceScore -= 10
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
