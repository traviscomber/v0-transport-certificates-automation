import 'server-only'

/**
 * OCR Engine — OpenAI Vision (gpt-4o)
 *
 * Sends raw document bytes directly to OpenAI as a base64 data URL.
 * - PDFs are sent as application/pdf data URLs
 * - Images are sent as image/png or image/jpeg data URLs
 * - No pdfjs, canvas, Tesseract, native binaries, or web workers
 * - Server-only and compatible with the Vercel Node runtime
 */

export type LocalOcrResult = {
  documentType: string
  expirationDate: string | null
  issuanceDate: string | null
  documentNumber: string | null
  extractedText: string
  confidence: number
  warnings: string[]
  pagesProcessed: number
}

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'
const MODEL = 'gpt-4o'

function normalizeDate(raw: string | undefined): string | null {
  if (!raw) return null
  const match = raw.match(/(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})/)
  if (!match) return null

  const iso = `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`
  const date = new Date(`${iso}T00:00:00Z`)
  return Number.isNaN(date.getTime()) ? null : iso
}

function inferMetadata(text: string, expectedType: string) {
  const issuance = text.match(
    /(?:fecha\s+de\s+emisi[oó]n|emitido|emisi[oó]n)\s*[:\-]?\s*(\d{1,2}[\/.\-]\d{1,2}[\/.\-]\d{4})/i,
  )
  const expiration = text.match(
    /(?:fecha\s+de\s+vencimiento|vencimiento|vigente\s+hasta)\s*[:\-]?\s*(\d{1,2}[\/.\-]\d{1,2}[\/.\-]\d{4})/i,
  )
  const number = text.match(
    /(?:folio|n[uú]mero|n[°º]|documento)\s*[:\-]?\s*([A-Z0-9.\-]{4,30})/i,
  )

  return {
    documentType: expectedType || 'DOCUMENTO',
    issuanceDate: normalizeDate(issuance?.[1]),
    expirationDate: normalizeDate(expiration?.[1]),
    documentNumber: number?.[1] ?? null,
  }
}

async function callOpenAIVision(
  bytes: Uint8Array,
  mimeType: string,
  expectedType: string,
): Promise<{ text: string; confidence: number }> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured')

  const base64 = Buffer.from(bytes).toString('base64')
  const dataUrl = `data:${mimeType};base64,${base64}`

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content:
            'Eres un sistema experto en OCR de documentos laborales y legales chilenos. Extrae TODO el texto con máxima fidelidad.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Tipo de documento esperado: ${expectedType}. Extrae TODO el texto visible en el documento con máxima fidelidad. Conserva fechas, RUTs, nombres y números exactamente como aparecen. Responde SOLO con el texto extraído, sin comentarios.`,
            },
            {
              type: 'image_url',
              image_url: { url: dataUrl, detail: 'high' },
            },
          ],
        },
      ],
      max_tokens: 3000,
      temperature: 0,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`OpenAI Vision returned ${response.status}: ${errorBody.slice(0, 300)}`)
  }

  const json = await response.json()
  const text: string = (json.choices?.[0]?.message?.content ?? '').trim()
  const confidence = json.choices?.[0]?.finish_reason === 'stop' ? 0.92 : 0.72

  return { text, confidence }
}

export async function extractDocumentLocally(
  bytes: Uint8Array,
  expectedType = 'DOCUMENTO',
  mimeType = 'application/pdf',
): Promise<LocalOcrResult> {
  if (!bytes.length) throw new Error('Document is empty')

  const { text, confidence } = await callOpenAIVision(bytes, mimeType, expectedType)
  if (text.length < 10) throw new Error('OpenAI Vision returned insufficient text')

  const metadata = inferMetadata(text, expectedType)

  return {
    ...metadata,
    extractedText: text,
    confidence,
    warnings: ['openai_vision_ocr'],
    pagesProcessed: 1,
  }
}
