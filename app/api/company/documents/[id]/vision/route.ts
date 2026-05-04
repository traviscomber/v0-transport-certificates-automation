import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Zod schema for vision analysis result
const visionResultSchema = z.object({
  document_type: z.string().describe('Type of document (e.g., cedula, licencia, contrato, factura)'),
  extracted_data: z.record(z.any()).describe('Key information extracted from document (nombre, rut, fecha, etc)'),
  validation_result: z.object({
    is_valid: z.boolean().describe('Whether the document appears valid and complete'),
    issues: z.array(z.string()).describe('List of potential issues found'),
  }).describe('Validation results'),
  anomalies: z.array(z.string()).describe('List of detected anomalies or suspicious elements'),
  ocr_text: z.string().describe('Full text extracted from document using OCR'),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = params.id
    console.log('[v0] Vision processing started for document:', documentId)

    const supabase = await createClient()

    // Get document from database
    const { data: document, error: docError } = await supabase
      .from('uploaded_documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (docError || !document) {
      console.error('[v0] Document not found:', docError)
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(document.storage_path)

    if (downloadError || !fileData) {
      console.error('[v0] Error downloading file:', downloadError)
      throw new Error(`Failed to download document: ${downloadError?.message}`)
    }

    // Convert blob to base64
    const buffer = await fileData.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')

    // Determine media type based on file extension
    const ext = path.extname(document.storage_path).toLowerCase()
    let mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' = 'image/jpeg'
    if (ext === '.png') mediaType = 'image/png'
    else if (ext === '.gif') mediaType = 'image/gif'
    else if (ext === '.webp') mediaType = 'image/webp'

    console.log('[v0] Processing image:', ext, 'Media type:', mediaType)

    // Call GPT-4 Vision with structured output using generateObject
    const result = await generateObject({
      model: openai('gpt-4-turbo'),
      schema: visionResultSchema,
      prompt: `Analyze this document image and extract all relevant information. 
        Identify the document type, extract key data, validate completeness, 
        detect any anomalies or signs of alteration, and perform OCR to extract all text.
        
        Return structured data with:
        - document_type: Type of document
        - extracted_data: Object with all extracted fields (nombre, rut, fecha, empresa, etc)
        - validation_result: Object with is_valid boolean and list of issues
        - anomalies: Array of detected anomalies
        - ocr_text: Full text from document`,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              image: {
                format: mediaType,
                data: base64,
              },
            },
          ],
        },
      ],
    })

    console.log('[v0] Vision analysis completed:', result.object)

    // Save results to database
    const { error: updateError } = await supabase
      .from('uploaded_documents')
      .update({
        vision_status: 'completed',
        document_type: result.object.document_type,
        extracted_data: result.object.extracted_data,
        validation_result: result.object.validation_result,
        anomalies_detected: result.object.anomalies,
        ocr_text: result.object.ocr_text,
        vision_processed_at: new Date().toISOString(),
      })
      .eq('id', documentId)

    if (updateError) {
      console.error('[v0] Error saving vision results:', updateError)
      throw updateError
    }

    console.log('[v0] Vision results saved successfully')

    return NextResponse.json({
      success: true,
      documentId,
      result: result.object,
    })
  } catch (error) {
    console.error('[v0] Vision processing error:', error)

    // Save error to database
    const supabase = await createClient()
    const documentId = params.id
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    await supabase
      .from('uploaded_documents')
      .update({
        vision_status: 'error',
        vision_error: errorMessage,
        vision_processed_at: new Date().toISOString(),
      })
      .eq('id', documentId)

    return NextResponse.json(
      { error: 'Failed to process document vision', details: errorMessage },
      { status: 500 }
    )
  }
}
