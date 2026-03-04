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
          
Analiza esta CÉDULA DE IDENTIDAD CHILENA y extrae:

CAMPOS OBLIGATORIOS:
- RUT del titular (formato chileno con puntos y guión: XX.XXX.XXX-X)
- Nombre completo del titular (nombre y apellidos)
- Fecha de nacimiento (DD/MM/YYYY)
- Sexo (Masculino/Femenino/Otro)
- Fecha de emisión (DD/MM/YYYY)
- Fecha de vencimiento (DD/MM/YYYY)
- Número de cédula (si aparece en el documento)

CAMPOS ADICIONALES:
- Lugar de nacimiento (ciudad/región)
- Comuna de residencia
- Estado civil (si aparece)
- Profesión u ocupación (si aparece)
- Altura del titular (si aparece)
- Seña particular (si aparece)

Responde ÚNICAMENTE en formato JSON válido:
{
  "rut": "string",
  "nombreCompleto": "string",
  "nombre": "string",
  "apellidos": "string",
  "fechaNacimiento": "string",
  "sexo": "string",
  "fechaEmision": "string",
  "fechaVencimiento": "string",
  "numeroCedula": "string",
  "lugarNacimiento": "string",
  "comunaResidencia": "string",
  "estadoCivil": "string",
  "profesion": "string",
  "altura": "string",
  "senaParticular": "string"
}`

        case "pasaporte":
          return `${baseInstructions}
          
Analiza este PASAPORTE CHILENO y extrae:

CAMPOS OBLIGATORIOS:
- Número de pasaporte
- RUT del titular (formato chileno)
- Nombre completo
- Nacionalidad
- Fecha de nacimiento (DD/MM/YYYY)
- Sexo
- Fecha de emisión (DD/MM/YYYY)
- Fecha de vencimiento (DD/MM/YYYY)
- Lugar de emisión

Responde ÚNICAMENTE en formato JSON válido:
{
  "numeroPasaporte": "string",
  "rut": "string",
  "nombreCompleto": "string",
  "nacionalidad": "string",
  "fechaNacimiento": "string",
  "sexo": "string",
  "fechaEmision": "string",
  "fechaVencimiento": "string",
  "lugarEmision": "string"
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

    // Parse the JSON response
    let extractedData
    try {
      extractedData = JSON.parse(text)

      if (extractedData) {
        // Validate RUTs if present
        const rutFields = ["rutTransportista", "rutPropietario", "rutConductor", "rutContratante"]
        rutFields.forEach((field) => {
          if (extractedData[field] && !validateChileanRUT(extractedData[field])) {
            extractedData[`${field}_warning`] = "Formato de RUT inválido"
          }
        })

        // Validate dates if present
        const dateFields = ["fechaEmision", "fechaVencimiento", "fechaRevision", "fechaInicio", "fechaNacimiento"]
        dateFields.forEach((field) => {
          if (extractedData[field] && !validateChileanDate(extractedData[field])) {
            extractedData[`${field}_warning`] = "Formato de fecha inválido"
          }
        })

        // Add confidence score based on validation
        const warnings = Object.keys(extractedData).filter((key) => key.endsWith("_warning"))
        extractedData.confidence = warnings.length === 0 ? "high" : warnings.length <= 2 ? "medium" : "low"
      }
    } catch (parseError) {
      if (process.env.NODE_ENV === 'development') console.log("[v0] JSON parsing failed, using raw text")
      // If JSON parsing fails, return the raw text
      extractedData = {
        rawAnalysis: text,
        confidence: "low",
        parseError: "No se pudo parsear la respuesta como JSON válido",
      }
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
