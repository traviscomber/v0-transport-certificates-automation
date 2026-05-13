import OpenAI from 'openai'
import { z } from 'zod'

// Define the extraction schema
const DocumentExtractionSchema = z.object({
  documentType: z.string().describe('Type of document (e.g., "Licencia de Conducir", "Certificado de Antecedentes", "Póliza de Seguro", "Verificación Técnica")'),
  expirationDate: z.string().nullable().describe('Expiration date in YYYY-MM-DD format, or null if not found'),
  issuanceDate: z.string().nullable().describe('Issuance date in YYYY-MM-DD format, or null if not found'),
  documentNumber: z.string().nullable().describe('Document number, ID number, or reference number'),
  extractedText: z.string().describe('Key information extracted from the document'),
  confidence: z.number().min(0).max(1).describe('Confidence score of the extraction (0-1)'),
  warnings: z.array(z.string()).describe('Any warnings or issues detected'),
})

type DocumentExtraction = z.infer<typeof DocumentExtractionSchema>

/**
 * Extract metadata from a document using Claude Haiku vision
 * @param imageBase64 - Base64 encoded image
 * @param mimeType - MIME type of the image
 * @returns Extracted metadata
 */
export async function extractDocumentMetadata(
  imageBase64: string,
  mimeType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' = 'image/jpeg'
): Promise<DocumentExtraction> {
  try {
    // Initialize OpenAI client at runtime, not at module load time
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set')
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    console.log('[v0] Starting document extraction with OpenAI Vision...')

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`,
                detail: 'high',
              },
            },
            {
              type: 'text',
              text: `Analyze this document image and extract the following information in JSON format:
1. Document type (e.g., Licencia de Conducir, Certificado de Antecedentes, Póliza de Seguro, etc.)
2. Expiration date (YYYY-MM-DD format, or null)
3. Issuance date (YYYY-MM-DD format, or null)
4. Document number or reference number (or null)
5. Key information extracted
6. Confidence score (0-1, where 1 is very confident)
7. Any warnings or issues

Respond ONLY with valid JSON matching this structure:
{
  "documentType": "string",
  "expirationDate": "YYYY-MM-DD or null",
  "issuanceDate": "YYYY-MM-DD or null",
  "documentNumber": "string or null",
  "extractedText": "key information",
  "confidence": 0.95,
  "warnings": ["any issues"]
}`,
            },
          ],
        },
      ],
      max_tokens: 500,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    console.log('[v0] OpenAI response:', content)

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from response')
    }

    const parsed = JSON.parse(jsonMatch[0])
    const extraction = DocumentExtractionSchema.parse(parsed)

    console.log('[v0] Document extraction successful:', {
      documentType: extraction.documentType,
      expirationDate: extraction.expirationDate,
      confidence: extraction.confidence,
    })

    return extraction
  } catch (error) {
    console.error('[v0] Document extraction error:', error)
    throw error
  }
}

/**
 * Determine document status based on expiration date
 */
export function getDocumentStatus(
  expirationDate: string | null,
  daysWarningThreshold: number = 30
): 'vigente' | 'por-vencer' | 'vencido' | 'pendiente' {
  if (!expirationDate) {
    return 'pendiente'
  }

  const expDate = new Date(expirationDate)
  const today = new Date()
  const daysUntilExpiration = Math.floor((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntilExpiration < 0) {
    return 'vencido'
  } else if (daysUntilExpiration <= daysWarningThreshold) {
    return 'por-vencer'
  } else {
    return 'vigente'
  }
}
