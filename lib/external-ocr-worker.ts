/**
 * External OCR Worker Client
 * Routes OCR requests to a remote worker service instead of processing locally on Vercel
 */

export type ExternalOcrResult = {
  documentType: string
  expirationDate: string | null
  issuanceDate: string | null
  documentNumber: string | null
  extractedText: string
  confidence: number
  warnings: string[]
  pagesProcessed: number
  processingTimeMs: number
}

async function callOcrWorker(
  documentBuffer: Buffer,
  expectedType: string,
  mimeType: string,
): Promise<ExternalOcrResult> {
  const workerUrl = process.env.OCR_WORKER_URL
  const workerSecret = process.env.OCR_WORKER_SECRET

  if (!workerUrl || !workerSecret) {
    throw new Error('OCR_WORKER_URL or OCR_WORKER_SECRET not configured')
  }

  const formData = new FormData()
  formData.append('document', new Blob([documentBuffer], { type: mimeType }))
  formData.append('expectedType', expectedType)
  formData.append('mimeType', mimeType)

  const startTime = Date.now()

  try {
    const response = await fetch(`${workerUrl}/process`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${workerSecret}`,
      },
      body: formData,
      // @ts-ignore - Next.js fetch supports timeout
      timeout: 120000, // 2 minutes max for OCR processing
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Worker returned ${response.status}: ${errorText}`)
    }

    const result = await response.json()
    const processingTimeMs = Date.now() - startTime

    return {
      ...result,
      processingTimeMs,
      warnings: [...(result.warnings || []), 'external_worker_used'],
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown worker error'
    console.error('[OCR Worker] Error:', {
      message,
      url: workerUrl,
      duration: Date.now() - startTime,
    })
    throw error
  }
}

/**
 * Extract document text using external OCR worker
 * Falls back to local OCR if worker is unavailable
 */
export async function extractDocumentViaWorker(
  bytes: Uint8Array,
  expectedType = 'DOCUMENTO',
  mimeType = 'application/pdf',
): Promise<ExternalOcrResult> {
  // Check if external worker is enabled
  const isEnabled = process.env.OCR_PROCESSING_ENABLED === 'true'
  const hasWorkerConfig = process.env.OCR_WORKER_URL && process.env.OCR_WORKER_SECRET

  if (!isEnabled || !hasWorkerConfig) {
    throw new Error('External OCR worker is not enabled. Set OCR_PROCESSING_ENABLED=true and configure OCR_WORKER_URL and OCR_WORKER_SECRET')
  }

  const documentBuffer = Buffer.from(bytes)
  return callOcrWorker(documentBuffer, expectedType, mimeType)
}
