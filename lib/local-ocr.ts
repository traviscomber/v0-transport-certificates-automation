import { createWorker } from 'tesseract.js'

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

const MAX_PDF_PAGES = 2
const PDF_RENDER_SCALE = 1.6

function getCreateCanvas(): (width: number, height: number) => any {
  const runtimeRequire = eval('require') as NodeRequire
  return runtimeRequire('@napi-rs/canvas').createCanvas
}

function normalizeDate(raw: string | undefined): string | null {
  if (!raw) return null
  const match = raw.match(/(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})/)
  if (!match) return null
  const [, day, month, year] = match
  const iso = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  const parsed = new Date(`${iso}T00:00:00Z`)
  return Number.isNaN(parsed.getTime()) ? null : iso
}

function inferMetadata(text: string, expectedType: string) {
  const issuance = text.match(/(?:fecha\s+de\s+emisi[oó]n|emitido|emisi[oó]n)\s*[:\-]?\s*(\d{1,2}[\/.\-]\d{1,2}[\/.\-]\d{4})/i)
  const expiration = text.match(/(?:fecha\s+de\s+vencimiento|vencimiento|vigente\s+hasta)\s*[:\-]?\s*(\d{1,2}[\/.\-]\d{1,2}[\/.\-]\d{4})/i)
  const number = text.match(/(?:folio|n[uú]mero|n[°º]|documento)\s*[:\-]?\s*([A-Z0-9.\-]{4,30})/i)

  return {
    documentType: expectedType || 'DOCUMENTO',
    issuanceDate: normalizeDate(issuance?.[1]),
    expirationDate: normalizeDate(expiration?.[1]),
    documentNumber: number?.[1] ?? null,
  }
}

async function recognizeImages(images: Buffer[], expectedType: string): Promise<LocalOcrResult> {
  const worker = await createWorker('spa+eng')
  const texts: string[] = []
  const confidences: number[] = []

  try {
    for (const image of images) {
      const result = await worker.recognize(image)
      const text = String(result.data.text ?? '').replace(/\u0000/g, '').trim()
      if (text) texts.push(text)
      if (Number.isFinite(result.data.confidence)) confidences.push(result.data.confidence)
    }
  } finally {
    await worker.terminate()
  }

  const extractedText = texts.join('\n\n--- PAGE ---\n\n').trim()
  const averageConfidence = confidences.length
    ? confidences.reduce((sum, value) => sum + value, 0) / confidences.length / 100
    : 0
  const metadata = inferMetadata(extractedText, expectedType)

  return {
    ...metadata,
    extractedText,
    confidence: Math.max(0, Math.min(1, averageConfidence)),
    warnings: ['local_ocr_used', ...(images.length >= MAX_PDF_PAGES ? ['pdf_page_limit_applied'] : [])],
    pagesProcessed: images.length,
  }
}

async function renderPdfPages(bytes: Uint8Array): Promise<Buffer[]> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const createCanvas = getCreateCanvas()
  const loadingTask = pdfjs.getDocument({ data: bytes, disableWorker: true })
  const pdf = await loadingTask.promise
  const pageCount = Math.min(pdf.numPages, MAX_PDF_PAGES)
  const images: Buffer[] = []

  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const viewport = page.getViewport({ scale: PDF_RENDER_SCALE })
    const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height))
    const context = canvas.getContext('2d')
    await page.render({ canvasContext: context, viewport }).promise
    images.push(canvas.toBuffer('image/png'))
    page.cleanup()
  }

  await pdf.destroy()
  return images
}

export async function extractDocumentLocally(
  bytes: Uint8Array,
  expectedType = 'DOCUMENTO',
  mimeType = 'application/pdf',
): Promise<LocalOcrResult> {
  const isPdf = mimeType.includes('pdf') || bytes.slice(0, 4).toString() === '37,80,68,70'
  const images = isPdf ? await renderPdfPages(bytes) : [Buffer.from(bytes)]
  if (!images.length) throw new Error('No pages available for OCR')

  const result = await recognizeImages(images, expectedType)
  if (result.extractedText.length < 10) throw new Error('Local OCR returned insufficient text')
  return result
}
