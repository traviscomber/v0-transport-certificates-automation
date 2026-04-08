import { type NextRequest, NextResponse } from "next/server"

function validateChileanRUT(rut: string): boolean {
  if (!rut) return false

  // Remove dots and hyphens, convert to uppercase
  const cleanRUT = rut.replace(/[.-]/g, "").toUpperCase()

  // Check format: 7-8 digits + 1 check digit
  if (!/^\d{7,8}[0-9K]$/.test(cleanRUT)) return false

  const digits = cleanRUT.slice(0, -1)
  const checkDigit = cleanRUT.slice(-1)

  // Calculate check digit
  let sum = 0
  let multiplier = 2

  for (let i = digits.length - 1; i >= 0; i--) {
    sum += Number.parseInt(digits[i]) * multiplier
    multiplier = multiplier === 7 ? 2 : multiplier + 1
  }

  const remainder = sum % 11
  const calculatedCheckDigit =
    remainder < 2 ? remainder.toString() : remainder === 10 ? "K" : (11 - remainder).toString()

  return checkDigit === calculatedCheckDigit
}

function validateChileanDate(dateStr: string): boolean {
  if (!dateStr) return false

  // Accept formats: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD
  const dateRegex = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$|^(\d{4})-(\d{1,2})-(\d{1,2})$/
  return dateRegex.test(dateStr)
}

export async function POST(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'development') console.log("[v0] Starting document analysis...")

    const formData = await request.formData()
    const file = formData.get("file") as File
    const documentType = formData.get("documentType") as string

    if (process.env.NODE_ENV === 'development') console.log("[v0] File received:", file?.name, "Type:", documentType)

    if (!file) {
      if (process.env.NODE_ENV === 'development') console.log("[v0] No file provided")
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("[v0] OPENAI_API_KEY not found in environment variables")
      return NextResponse.json(
        {
          error: "OpenAI API key not configured",
          details: "Please add OPENAI_API_KEY to your environment variables",
        },
        { status: 500 },
      )
    }

    // Convert file to base64 for OpenAI Vision API
    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString("base64")
    const mimeType = file.type

    if (process.env.NODE_ENV === 'development') console.log("[v0] File converted to base64, size:", bytes.byteLength, "bytes")

    const getPromptForDocumentType = (type: string) => {
      const baseInstructions = `
IMPORTANTE: Este es un documento oficial chileno. Presta especial atención a:
- Formatos de RUT chilenos (XX.XXX.XXX-X o XXXXXXXX-X)
- Formatos de fecha chilenos (DD/MM/YYYY o DD-MM-YYYY)
- Patentes chilenas (formato XXXX-XX para vehículos nuevos, XX-XXXX para antiguos)
- Nombres de comunas chilenas
- Terminología específica del transporte chileno

Si no puedes leer claramente algún campo, indica "No legible" en lugar de inventar información.
`

      switch (type) {
        case "cedula-identidad":
          return `${baseInstructions}

Analiza esta CÉDULA DE IDENTIDAD CHILENA y extrae los datos. 

IMPORTANTE: Responde ÚNICAMENTE con un JSON válido, sin backticks, sin explicaciones adicionales.

CAMPOS A EXTRAER:
- rut: RUT del titular en formato XX.XXX.XXX-X
- nombreCompleto: Nombre completo (nombre y apellidos)
- nombre: Solo el nombre de pila
- apellidos: Apellidos completos
- fechaNacimiento: Fecha en formato DD/MM/YYYY
- sexo: Masculino, Femenino u Otro
- fechaEmision: Fecha en formato DD/MM/YYYY
- fechaVencimiento: Fecha en formato DD/MM/YYYY
- numeroCedula: Número de serie si aparece

Si no puedes leer un campo claramente, OMÍTELO del JSON en lugar de poner "No legible".

Responde solo con JSON válido:
{
  "rut": "valor",
  "nombreCompleto": "valor",
  "nombre": "valor",
  "apellidos": "valor",
  "fechaNacimiento": "valor",
  "sexo": "valor",
  "fechaEmision": "valor",
  "fechaVencimiento": "valor"
}`

        case "f30":
          return `${baseInstructions}
          
Analiza este CERTIFICADO F-30 CHILENO (Certificado de Inscripción en el Registro Nacional de Servicios de Transporte de Carga) y extrae la siguiente información:

CAMPOS OBLIGATORIOS:
- Número de certificado F-30 (formato: F30-YYYY-XXXXXX)
- RUT del transportista (formato chileno con puntos y guión)
- Nombre/razón social completa del transportista
- Fecha de emisión (formato DD/MM/YYYY)
- Fecha de vencimiento (formato DD/MM/YYYY)
- Patente del vehículo (formato chileno)
- Tipo de vehículo (camión, camioneta, furgón, etc.)
- Estado del certificado (vigente, vencido, suspendido)

CAMPOS ADICIONALES:
- Observaciones o restricciones específicas
- Número de resolución (si aparece)
- Región de emisión

Responde ÚNICAMENTE en formato JSON válido con estas claves exactas:
{
  "numeroF30": "string",
  "rutTransportista": "string", 
  "nombreTransportista": "string",
  "fechaEmision": "string",
  "fechaVencimiento": "string", 
  "patenteVehiculo": "string",
  "tipoVehiculo": "string",
  "estado": "string",
  "observaciones": "string",
  "numeroResolucion": "string",
  "region": "string"
}`

        case "f30-1":
          return `${baseInstructions}
          
Analiza este CERTIFICADO F-30-1 CHILENO (Certificado Complementario de Inscripción) y extrae:

CAMPOS OBLIGATORIOS:
- Número de certificado F-30-1 (formato: F30-1-YYYY-XXXXXX)
- RUT del transportista (formato chileno)
- Nombre/razón social completa del transportista
- Fecha de emisión (DD/MM/YYYY)
- Fecha de vencimiento (DD/MM/YYYY)
- Patente del vehículo
- Capacidad de carga en toneladas
- Estado del certificado

CAMPOS ADICIONALES:
- Tipo de carga autorizada
- Restricciones específicas
- Número de resolución

Responde ÚNICAMENTE en formato JSON válido:
{
  "numeroF30_1": "string",
  "rutTransportista": "string",
  "nombreTransportista": "string", 
  "fechaEmision": "string",
  "fechaVencimiento": "string",
  "patenteVehiculo": "string",
  "capacidadCarga": "string",
  "tipoCarga": "string",
  "estado": "string",
  "observaciones": "string"
}`

        case "permiso-circulacion":
          return `${baseInstructions}
          
Analiza este PERMISO DE CIRCULACIÓN CHILENO y extrae:

CAMPOS OBLIGATORIOS:
- Patente del vehículo (formato chileno)
- RUT del propietario (formato chileno con puntos y guión)
- Nombre completo del propietario
- Marca del vehículo
- Modelo del vehículo
- Año del vehículo (4 dígitos)
- Fecha de vencimiento (DD/MM/YYYY)
- Comuna de inscripción (nombre completo)

CAMPOS ADICIONALES:
- Color del vehículo
- Número de motor
- Número de chasis
- Uso del vehículo (particular, comercial, etc.)

Responde ÚNICAMENTE en formato JSON válido:
{
  "patente": "string",
  "rutPropietario": "string",
  "nombrePropietario": "string",
  "marca": "string", 
  "modelo": "string",
  "ano": "string",
  "fechaVencimiento": "string",
  "comuna": "string",
  "color": "string",
  "numeroMotor": "string",
  "numeroChasis": "string",
  "uso": "string"
}`

        case "licencia-conducir":
          return `${baseInstructions}
          
Analiza esta LICENCIA DE CONDUCIR CHILENA y extrae:

CAMPOS OBLIGATORIOS:
- RUT del conductor (formato chileno)
- Nombre completo del conductor
- Número de licencia
- Clase de licencia (A1, A2, A3, A4, A5, B, C, D, E, F)
- Fecha de emisión (DD/MM/YYYY)
- Fecha de vencimiento (DD/MM/YYYY)

CAMPOS ADICIONALES:
- Restricciones (lentes, audífono, etc.)
- Municipalidad emisora
- Fecha de nacimiento del conductor
- Donante de órganos (sí/no)

Responde ÚNICAMENTE en formato JSON válido:
{
  "rutConductor": "string",
  "nombreConductor": "string",
  "numeroLicencia": "string", 
  "claseLicencia": "string",
  "fechaEmision": "string",
  "fechaVencimiento": "string",
  "restricciones": "string",
  "municipalidad": "string",
  "fechaNacimiento": "string",
  "donante": "string"
}`

        case "revision-tecnica":
          return `${baseInstructions}
          
Analiza este CERTIFICADO DE REVISIÓN TÉCNICA CHILENO y extrae:

CAMPOS OBLIGATORIOS:
- Patente del vehículo
- RUT del propietario
- Nombre del propietario
- Fecha de revisión
- Fecha de vencimiento
- Resultado (aprobado/rechazado)
- Planta revisora

CAMPOS ADICIONALES:
- Número de certificado
- Observaciones o defectos
- Kilometraje

Responde ÚNICAMENTE en formato JSON válido:
{
  "patente": "string",
  "rutPropietario": "string", 
  "nombrePropietario": "string",
  "fechaRevision": "string",
  "fechaVencimiento": "string",
  "resultado": "string",
  "plantaRevisora": "string",
  "numeroCertificado": "string",
  "observaciones": "string",
  "kilometraje": "string"
}`

        case "seguro-obligatorio":
          return `${baseInstructions}
          
Analiza este SEGURO OBLIGATORIO DE ACCIDENTES PERSONALES (SOAP) CHILENO y extrae:

CAMPOS OBLIGATORIOS:
- Patente del vehículo
- RUT del contratante
- Nombre del contratante
- Compañía de seguros
- Número de póliza
- Fecha de inicio de vigencia
- Fecha de vencimiento

CAMPOS ADICIONALES:
- Prima pagada
- Agente o corredor
- Sucursal

Responde ÚNICAMENTE en formato JSON válido:
{
  "patente": "string",
  "rutContratante": "string",
  "nombreContratante": "string", 
  "companiaSeguro": "string",
  "numeroPoliza": "string",
  "fechaInicio": "string",
  "fechaVencimiento": "string",
  "prima": "string",
  "agente": "string",
  "sucursal": "string"
}`

        default:
          return `${baseInstructions}
          
Analiza este documento chileno de transporte y extrae toda la información relevante:

BUSCA ESPECIALMENTE:
- Tipo de documento
- Números de identificación o certificación
- RUTs (formato chileno)
- Nombres de personas o empresas
- Fechas importantes (emisión, vencimiento)
- Patentes de vehículos
- Información específica del transporte

Responde ÚNICAMENTE en formato JSON válido con las claves más apropiadas para la información encontrada.`
      }
    }

    console.log("[v0] Calling OpenAI Vision API directly with gpt-4o...")

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
                text: getPromptForDocumentType(documentType)
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
      throw new Error(errorData.error?.message || "OpenAI API failed")
    }

    const responseData = await openaiResponse.json()
    const text = responseData.choices[0]?.message?.content || ""

    if (process.env.NODE_ENV === 'development') console.log("[v0] OpenAI response received:", text.substring(0, 200) + "...")

    // Parse the JSON response with robust error handling
    let extractedData
    try {
      // Clean up the response text - sometimes OpenAI returns escaped JSON or extra formatting
      let cleanedText = text.trim()
      
      console.log("[v0] Raw response:", cleanedText.substring(0, 100))
      
      // Remove markdown code blocks if present (multiple patterns)
      // Handle: ```json { ... }```, ```{ ... }```, or just ``json
      cleanedText = cleanedText.replace(/```(json)?\s*/g, "").replace(/\s*```/g, "")
      
      // Remove any leading/trailing quotes that might wrap the entire JSON
      cleanedText = cleanedText.replace(/^["']/, "").replace(/["']$/, "")
      
      // Try to find JSON object in the text
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        cleanedText = jsonMatch[0]
      }
      
      console.log("[v0] Cleaned response:", cleanedText.substring(0, 100))
      
      // Parse the cleaned JSON
      extractedData = JSON.parse(cleanedText)

      if (extractedData) {
        // Count how many critical fields are present and valid
        const criticalFields = ["rut", "nombreCompleto", "nombre", "apellidos", "fechaNacimiento"]
        const presentFields = criticalFields.filter(field => extractedData[field] && String(extractedData[field]).trim())
        
        // Validate RUTs if present
        const rutFields = ["rutTransportista", "rutPropietario", "rutConductor", "rutContratante", "rut"]
        let validRUTs = 0
        let invalidRUTs = 0
        rutFields.forEach((field) => {
          if (extractedData[field]) {
            if (validateChileanRUT(extractedData[field])) {
              validRUTs++
            } else {
              invalidRUTs++
              extractedData[`${field}_warning`] = "Formato de RUT inválido"
            }
          }
        })

        // Validate dates if present
        const dateFields = ["fechaEmision", "fechaVencimiento", "fechaRevision", "fechaInicio", "fechaNacimiento"]
        let validDates = 0
        let invalidDates = 0
        dateFields.forEach((field) => {
          if (extractedData[field]) {
            if (validateChileanDate(extractedData[field])) {
              validDates++
            } else {
              invalidDates++
              extractedData[`${field}_warning`] = "Formato de fecha inválido"
            }
          }
        })

        // Calculate confidence based on data completeness and validity
        const fieldCoverage = presentFields.length / criticalFields.length
        const hasInvalidData = invalidRUTs > 0 || invalidDates > 0
        
        if (fieldCoverage >= 0.8 && !hasInvalidData && validDates >= 2) {
          extractedData.confidence = "high"
        } else if (fieldCoverage >= 0.5 && invalidRUTs === 0) {
          extractedData.confidence = "medium"
        } else {
          extractedData.confidence = "low"
        }
        
        console.log("[v0] Confidence calculation:", { fieldCoverage, hasInvalidData, validDates, confidence: extractedData.confidence })
      }
    } catch (parseError) {
      if (process.env.NODE_ENV === 'development') console.log("[v0] JSON parsing failed, attempting text extraction")
      
      // If JSON parsing fails, try to extract key-value pairs manually
      extractedData = {
        rawAnalysis: text,
        confidence: "low",
        parseError: "Respuesta parseada con baja confianza - verificar manualmente",
      }
      
      // Try to extract common fields manually from text
      const commonPatterns: Record<string, RegExp> = {
        rut: /["\s]rut[":]?\s*[":]*([0-9]{1,2}\.[0-9]{3}\.[0-9]{3}-[0-9kK])/i,
        nombreCompleto: /["\s]nombreCompleto[":]?\s*[":]*([^",}]+)/i,
        nombre: /["\s]nombre[":]?\s*[":]*([^",}]+)/i,
        apellidos: /["\s]apellidos[":]?\s*[":]*([^",}]+)/i,
        fechaNacimiento: /["\s]fechaNacimiento[":]?\s*[":]*([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{4})/i,
        fechaVencimiento: /["\s]fechaVencimiento[":]?\s*[":]*([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{4})/i,
        fechaEmision: /["\s]fechaEmision[":]?\s*[":]*([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{4})/i,
      }
      
      Object.entries(commonPatterns).forEach(([field, pattern]) => {
        const match = text.match(pattern)
        if (match && match[1]) {
          extractedData[field] = match[1].trim()
        }
      })
    }

    if (process.env.NODE_ENV === 'development') console.log("[v0] Analysis completed successfully")

    return NextResponse.json({
      success: true,
      extractedData,
      documentType,
      fileName: file.name,
    })
  } catch (error) {
    console.error("[v0] Error analyzing document:", error)

    let errorMessage = "Error analyzing document"
    let errorDetails = "Unknown error"

    if (error instanceof Error) {
      errorDetails = error.message

      // Check for specific OpenAI API errors
      if (error.message.includes("API key")) {
        errorMessage = "OpenAI API key error"
        errorDetails = "Please check your OpenAI API key configuration"
      } else if (error.message.includes("rate limit")) {
        errorMessage = "Rate limit exceeded"
        errorDetails = "Please try again in a few minutes"
      } else if (error.message.includes("content policy")) {
        errorMessage = "Content policy violation"
        errorDetails = "The image content may violate OpenAI's usage policies"
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails,
      },
      { status: 500 },
    )
  }
}
