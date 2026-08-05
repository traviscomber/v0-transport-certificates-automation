/**
 * OCR Engine — OpenAI Vision (gpt-4o)
 *
 * Sends the raw document bytes directly to gpt-4o as a base64 data URL.
 * - PDFs are sent as application/pdf data URLs (gpt-4o reads PDFs natively)
 * - Images are sent as image/png or image/jpeg data URLs
 * - No pdfjs, no canvas, no native binaries, no web workers
 * - Works on all Vercel runtimes
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

// ─── date normalizer ─────────────────────────────────────────────────────────

function normalizeDate(raw: string | undefined): string | null {
  if (!raw) return null
  const m = raw.match(/(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})/)
  if (!m) return null
  const iso = `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`
  const d = new Date(`${iso}T00:00:00Z`)
  return Number.isNaN(d.getTime()) ? null : iso
}

// ─── metadata extractor ───────────────────────────────────────────────────────

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

// ─── OpenAI Vision call ───────────────────────────────────────────────────────

async function callOpenAIVision(
  bytes: Uint8Array,
  mimeType: string,
  expectedType: string,
): Promise<{ text: string; confidence: number }> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured')

  const base64 = Buffer.from(bytes).toString('base64')
  const dataUrl = `data:${mimeType};base64,${base64}`

  const isPdf = mimeType.includes('pdf')

  // gpt-4o supports PDFs natively via document type, images via image_url
  const documentContent = isPdf
    ? { type: 'document', source: { type: 'base64', media_type: mimeType, data: base64 } }
    : { type: 'image_url', image_url: { url: dataUrl, detail: 'high' } }

  // For gpt-4o use the standard vision format — PDF as image_url with data URL works too
  const userContent = [
    {
      type: 'text',
      text: `Tipo de documento esperado: ${expectedType}. Extrae TODO el texto visible en el documento con máxima fidelidad. Conserva fechas, RUTs, nombres y números exactamente como aparecen. Responde SOLO con el texto extraído, sin comentarios.`,
    },
    {
      type: 'image_url',
      image_url: { url: dataUrl, detail: 'high' },
    },
  ]

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
        { role: 'user', content: userContent },
      ],
      max_tokens: 3000,
      temperature: 0,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`OpenAI Vision returned ${response.status}: ${err.slice(0, 300)}`)
  }

  const json = await response.json()
  const text: string = (json.choices?.[0]?.message?.content ?? '').trim()
  const confidence = json.choices?.[0]?.finish_reason === 'stop' ? 0.92 : 0.72

  return { text, confidence }
}

// ─── public API ──────────────────────────────────────────────────────────────

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
