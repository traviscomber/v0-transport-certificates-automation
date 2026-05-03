import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === "development") console.log("[v0] Starting URL document analysis...")

    const body = await request.json()
    const { imageUrl, documentType } = body

    if (process.env.NODE_ENV === "development")
      console.log("[v0] Image URL received:", imageUrl, "Type:", documentType)

    if (!imageUrl || !documentType) {
      if (process.env.NODE_ENV === "development") console.log("[v0] Missing imageUrl or documentType")
      return NextResponse.json({ error: "Missing imageUrl or documentType" }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("[v0] OPENAI_API_KEY not found in environment variables")
      return NextResponse.json(
        {
          error: "OpenAI API key not configured",
          details: "Please add OPENAI_API_KEY to your environment variables",
        },
        { status: 500 }
      )
    }

    let base64 = ""
    let mimeType = "image/jpeg"

    // Handle public file paths (e.g., /test-documents/f30-sample.jpg)
    if (imageUrl.startsWith("/")) {
      try {
        const filePath = path.join(process.cwd(), "public", imageUrl)
        if (process.env.NODE_ENV === "development")
          console.log("[v0] Reading file from path:", filePath)

        const fileBuffer = fs.readFileSync(filePath)
        base64 = fileBuffer.toString("base64")

        // Determine MIME type from file extension
        const ext = path.extname(imageUrl).toLowerCase()
        const mimeTypes: { [key: string]: string } = {
          ".jpg": "image/jpeg",
          ".jpeg": "image/jpeg",
          ".png": "image/png",
          ".webp": "image/webp",
          ".gif": "image/gif"
        }
        mimeType = mimeTypes[ext] || "image/jpeg"

        if (process.env.NODE_ENV === "development")
          console.log("[v0] File read successfully, size:", fileBuffer.length, "bytes, type:", mimeType)
      } catch (error) {
        console.error("[v0] Error reading file:", error)
        return NextResponse.json({ error: "Failed to read image file" }, { status: 400 })
      }
    } else {
      // Handle base64 URLs
      if (imageUrl.startsWith("data:")) {
        const [header, data] = imageUrl.split(",")
        base64 = data
        const mimeMatch = header.match(/data:([^;]+)/)
        if (mimeMatch) mimeType = mimeMatch[1]
      } else {
        // Handle external URLs
        try {
          const response = await fetch(imageUrl)
          if (!response.ok) throw new Error("Failed to fetch image")
          const buffer = await response.arrayBuffer()
          base64 = Buffer.from(buffer).toString("base64")
          const contentType = response.headers.get("content-type") || "image/jpeg"
          mimeType = contentType
        } catch (error) {
          console.error("[v0] Error fetching external image:", error)
          return NextResponse.json({ error: "Failed to fetch image from URL" }, { status: 400 })
        }
      }
    }

    const getPromptForDocumentType = (type: string) => {
      const baseInstructions = `IMPORTANTE: Este es un documento oficial chileno. Presta especial atención a:
- Formatos de RUT chilenos (XX.XXX.XXX-X o XXXXXXXX-X)
- Formatos de fecha chilenos (DD/MM/YYYY o DD-MM-YYYY)
- Patentes chilenas (formato XXXX-XX para vehículos nuevos, XX-XXXX para antiguos)
- Nombres de comunas chilenas
- Terminología específica del transporte chileno

Si no puedes leer claramente algún campo, indica "No legible" en lugar de inventar información.`

      switch (type) {
        case "f30":
          return `${baseInstructions}

Analiza este CERTIFICADO F-30 CHILENO (Certificado de Inscripción en el Registro Nacional de Servicios de Transporte de Carga) y extrae la siguiente información en JSON:
{"numeroF30": "string", "rutTransportista": "string", "nombreTransportista": "string", "fechaEmision": "string", "fechaVencimiento": "string", "patenteVehiculo": "string", "tipoVehiculo": "string", "estado": "string", "observaciones": "string"}`

        case "licencia_conducir":
          return `${baseInstructions}

Analiza esta LICENCIA DE CONDUCIR CHILENA y extrae en JSON:
{"nombre": "string", "rut": "string", "clase": "string", "fechaEmision": "string", "fechaVencimiento": "string", "estado": "string", "restricciones": "string"}`

        case "revision_tecnica":
          return `${baseInstructions}

Analiza este CERTIFICADO DE REVISIÓN TÉCNICA CHILENO y extrae en JSON:
{"patente": "string", "marca": "string", "modelo": "string", "ano": "string", "fechaRevision": "string", "fechaVencimiento": "string", "estado": "string", "observaciones": "string"}`

        case "permiso_circulacion":
          return `${baseInstructions}

Analiza este PERMISO DE CIRCULACIÓN CHILENO y extrae en JSON:
{"patente": "string", "rutPropietario": "string", "nombrePropietario": "string", "marca": "string", "modelo": "string", "ano": "string", "fechaVencimiento": "string", "comuna": "string", "color": "string"}`

        default:
          return `${baseInstructions}\n\nExtrae toda la información legible de este documento chileno en formato JSON.`
      }
    }

    const prompt = getPromptForDocumentType(documentType)

    if (process.env.NODE_ENV === "development")
      console.log("[v0] Calling OpenAI Vision API directly...")

    // Call OpenAI API directly
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
                text: prompt
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64}`,
                  detail: "high"
                }
              }
            ]
          }
        ],
        max_tokens: 1024
      })
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json()
      console.error("[v0] OpenAI API Error:", errorData)
      return NextResponse.json(
        {
          error: "OpenAI Vision API error",
          details: errorData.error?.message || "Failed to analyze image"
        },
        { status: 500 }
      )
    }

    const responseData = await openaiResponse.json()
    const text = responseData.choices[0]?.message?.content || ""

    if (process.env.NODE_ENV === "development")
      console.log("[v0] OpenAI response received:", text.substring(0, 200) + "...")

    let extractedData: any = {}
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0])
      } else {
        extractedData = { rawAnalysis: text }
      }
    } catch (parseError) {
      if (process.env.NODE_ENV === "development")
        console.log("[v0] JSON parsing failed, using raw text")
      extractedData = {
        rawAnalysis: text,
        parseError: "Could not parse response as JSON"
      }
    }

    if (process.env.NODE_ENV === "development")
      console.log("[v0] Analysis completed successfully")

    return NextResponse.json({
      success: true,
      extractedData,
      rawResponse: text
    })
  } catch (error) {
    console.error("[v0] Analyze URL error:", error)
    return NextResponse.json(
      {
        error: "Failed to analyze document",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
