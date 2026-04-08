import { Anthropic } from '@anthropic-ai/sdk'
import { DOCUMENT_DETECTION_PROMPT } from '@/lib/document-detection'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { image, model, prompt } = await request.json()

    if (!image) {
      return Response.json({ error: 'Image data required' }, { status: 400 })
    }

    console.log('[v0] Detecting document type with model:', model)

    // Use Claude's vision capabilities
    const response = await anthropic.messages.create({
      model: model || 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: image.replace(/^data:image\/\w+;base64,/, ''),
              },
            },
            {
              type: 'text',
              text: prompt || DOCUMENT_DETECTION_PROMPT,
            },
          ],
        },
      ],
    })

    // Extract the text response
    const textContent = response.content.find((block) => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude')
    }

    // Parse the JSON response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Could not parse detection response')
    }

    const detectionResult = JSON.parse(jsonMatch[0])
    console.log('[v0] Detection result:', detectionResult.primaryDocument.code)

    return Response.json(detectionResult)
  } catch (error) {
    console.error('[v0] Document detection error:', error)
    return Response.json(
      {
        error: 'Failed to detect document type',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
