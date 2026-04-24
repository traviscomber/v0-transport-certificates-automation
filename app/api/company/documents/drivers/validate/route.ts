import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'

const DocumentValidationSchema = z.object({
  is_valid: z.boolean().describe('Whether the document is valid and readable'),
  document_type: z.enum(['license', 'id', 'passport', 'other']).describe('Type of document'),
  extracted_data: z.object({
    full_name: z.string().optional(),
    id_number: z.string().optional(),
    expiration_date: z.string().optional(),
    issue_date: z.string().optional(),
  }).describe('Data extracted from the document'),
  confidence: z.number().describe('Confidence level 0-1'),
  issues: z.array(z.string()).describe('Any issues found with the document'),
})

export async function POST(request: NextRequest) {
  try {
    const { file_url, document_type, driver_rut } = await request.json()

    if (!file_url) {
      return NextResponse.json({ error: 'File URL required' }, { status: 400 })
    }

    console.log('[v0] Starting document validation:', { file_url, document_type })

    // Validar con OpenAI Vision
    const model = openai('gpt-4-vision')
    
    const result = await generateObject({
      model,
      schema: DocumentValidationSchema,
      prompt: `Analyze this ${document_type} document image and extract the data.
      
      Check for:
      1. Is the document clear and readable?
      2. What type of document is it?
      3. Extract: full name, ID number, expiration date, issue date
      4. Rate confidence 0-1
      5. List any issues (blurry, expired, damaged, etc)
      
      Image URL: ${file_url}`,
    })

    console.log('[v0] Document validation result:', result.object)

    // Guardar resultado en Storage metadata
    const adminClient = createAdminClient()
    const validationData = {
      validated_at: new Date().toISOString(),
      validation_result: result.object,
      driver_rut,
    }

    console.log('[v0] Validation complete for driver:', driver_rut)

    return NextResponse.json({
      success: true,
      validation: result.object,
      extracted_data: result.object.extracted_data,
    })
  } catch (error) {
    console.error('[v0] Validation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Validation failed' },
      { status: 500 }
    )
  }
}
