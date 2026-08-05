/**
 * OCR Engine — OpenAI Vision
 *
 * Uses gpt-4o to extract text from PDF / image documents.
 * No native binaries required — works on Vercel Edge and Node runtimes.
 *
 * PDF pages are rendered to PNG via pdfjs-dist + canvas API before sending
 * to the model, using the Node.js built-in OffscreenCanvas (Node 22+) or a
 * lightweight polyfill.
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

const MAX_PDF_PAGES = 3
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

// ─── PDF → PNG pages using pdfjs-dist with node-canvas polyfill ──────────────

async function pdfToBase64Pages(bytes: Uint8Array): Promise<string[]> {
  // pdfjs needs a canvas factory. We use the built-in OffscreenCanvas in Node 22
  // or @napi-rs/canvas if available, otherwise we render via pdfjs getTextContent
  // and skip image rendering (text-only mode).
  let canvasFactory: unknown = undefined

  // Try @napi-rs/canvas for image rendering
  try {
    const { createCanvas } = eval('require')('@napi-rs/canvas') as {
      createCanvas: (w: number, h: number) => OffscreenCanvas
    }

    canvasFactory = {
      create(width: number, height: number) {
        const canvas = createCanvas(width, height)
        return { canvas, context: (canvas as any).getContext('2d') }
      },
      reset(canvasAndContext: any, width: number, height: number) {
        canvasAndContext.canvas.width = width
        canvasAndContext.canvas.height = height
      },
      destroy() {},
    }
  } catch {
    // canvas not available — will use text extraction only
  }

  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs' as string)
  const pdf = await (pdfjs as any).getDocument({
    data: bytes,
    useSystemFonts: true,
    ...(canvasFactory ? { canvasFactory } : {}),
  }).promise

  const pageCount = Math.min(pdf.numPages, MAX_PDF_PAGES)
  const pages: string[] = []

  for (let p = 1; p <= pageCount; p++) {
    const page = await pdf.getPage(p)

    if (canvasFactory) {
      const scale = 1.8
      const viewport = page.getViewport({ scale })
      const { createCanvas } = eval('require')('@napi-rs/canvas') as any
      const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height))
      const context = canvas.getContext('2d')
      await page.render({ canvasContext: context, viewport }).promise
      const pngBuffer: Buffer = canvas.toBuffer('image/png')
      pages.push(pngBuffer.toString('base64'))
    } else {
      // Text-only fallback: extract embedded text from the PDF itself
      const content = await page.getTextContent()
      const text = (content.items as any[])
        .map((item: any) => item.str ?? '')
        .join(' ')
        .trim()
      if (text.length > 10) pages.push(Buffer.from(text).toString('base64'))
    }

    page.cleanup()
  }

  await pdf.destroy()
  return pages
}

// ─── OpenAI Vision call ───────────────────────────────────────────────────────

async function callOpenAIVision(
  base64Pages: string[],
  expectedType: string,
  isText = false,
): Promise<{ text: string; confidence: number }> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured')

  const systemPrompt = `Eres un sistema experto en OCR de documentos laborales y legales chilenos.
Extrae TODO el texto del documento con la máxima fidelidad.
Conserva fechas, RUTs, nombres y números exactamente como aparecen.
Responde SOLO con el texto extraído, sin comentarios ni explicaciones.`

  let content: unknown[]

  if (isText) {
    // Text-only fallback: base64 pages contain UTF-8 text
    const decoded = base64Pages.map((b) => Buffer.from(b, 'base64').toString('utf-8')).join('\n\n')
    content = [
      {
        type: 'text',
        text: `Tipo de documento esperado: ${expectedType}\n\nTexto embebido en el PDF:\n${decoded}\n\nDevuelve todo el texto relevante del documento.`,
      },
    ]
  } else {
    content = [
      {
        type: 'text',
        text: `Tipo de documento esperado: ${expectedType}. Extrae TODO el texto visible en las siguientes imágenes de páginas del documento.`,
      },
      ...base64Pages.map((b64) => ({
        type: 'image_url',
        image_url: { url: `data:image/png;base64,${b64}`, detail: 'high' },
      })),
    ]
  }

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content },
      ],
      max_tokens: 2000,
      temperature: 0,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`OpenAI Vision returned ${response.status}: ${err}`)
  }

  const json = await response.json()
  const text = (json.choices?.[0]?.message?.content ?? '').trim()
  // Use finish_reason to estimate confidence: 'stop' = full text, 'length' = truncated
  const confidence = json.choices?.[0]?.finish_reason === 'stop' ? 0.92 : 0.70

  return { text, confidence }
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

// ─── public API ──────────────────────────────────────────────────────────────

export async function extractDocumentLocally(
  bytes: Uint8Array,
  expectedType = 'DOCUMENTO',
  mimeType = 'application/pdf',
): Promise<LocalOcrResult> {
  const isPdf =
    mimeType.includes('pdf') ||
    (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) // %PDF

  let base64Pages: string[]
  let isTextFallback = false

  if (isPdf) {
    base64Pages = await pdfToBase64Pages(bytes)
    // If pages are short, they came from text extraction (no canvas), flag accordingly
    isTextFallback = base64Pages.length > 0 && base64Pages.every(
      (b) => Buffer.from(b, 'base64').length < 500,
    )
  } else {
    // Direct image — send as-is
    base64Pages = [Buffer.from(bytes).toString('base64')]
  }

  if (!base64Pages.length) throw new Error('No pages available for OCR')

  const { text, confidence } = await callOpenAIVision(base64Pages, expectedType, isTextFallback)

  if (text.length < 10) throw new Error('OpenAI Vision returned insufficient text')

  const metadata = inferMetadata(text, expectedType)

  return {
    ...metadata,
    extractedText: text,
    confidence,
    warnings: ['openai_vision_ocr'],
    pagesProcessed: base64Pages.length,
  }
}
