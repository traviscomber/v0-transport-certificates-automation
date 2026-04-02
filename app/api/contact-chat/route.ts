import { NextRequest, NextResponse } from 'next/server'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_MODEL = 'gpt-4o-mini'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ConversationRequest {
  messages: Message[]
  userEmail?: string
  userName?: string
}

const SYSTEM_PROMPT = `Eres un agente conversacional amable de DocuFleet, una plataforma de automatización de documentos de transporte con IA.

Tu rol es:
1. **Onboarding conversacional**: Saluda al usuario, aprende sobre sus necesidades
2. **Responder preguntas**: Sobre DocuFleet, características, precios, integración
3. **Calificar necesidades**: Identifica si es Conductor, Despachador o Administrador
4. **Ser preparado para escalar**: Si el usuario solicita hablar con un humano, responde con "ESCALAR_WHATSAPP"

**Sobre DocuFleet:**
- Automatiza 35+ documentos de transporte
- Validación con IA (99% accuracy)
- Integración con sistemas existentes
- Manejo de múltiples roles: Conductores, Despachadores, Administradores
- Sin tarifas de configuración, pago por uso

**Preguntas frecuentes:**
- Precio: Flexible según volumen de documentos
- Setup: 5 minutos, integración sin código
- Soporte: 24/7 disponible

**Instrucciones especiales:**
- Si el usuario dice "quiero hablar con alguien", responde EXACTAMENTE: "ESCALAR_WHATSAPP"
- Mantén un tono conversacional y amigable
- Haz preguntas de seguimiento para entender mejor sus necesidades
- Sé conciso pero informativo (máximo 150 palabras por mensaje)
- En español siempre`

export async function POST(request: NextRequest) {
  try {
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const body: ConversationRequest = await request.json()
    const { messages, userEmail, userName } = body

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'No messages provided' },
        { status: 400 }
      )
    }

    // Build messages for OpenAI
    const openaiMessages: Message[] = [
      {
        role: 'user',
        content: `Contexto: Usuario: ${userName || 'Nuevo visitante'} | Email: ${userEmail || 'No proporcionado'}`,
      },
      ...messages,
    ]

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          ...openaiMessages,
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('OpenAI API error:', error)
      return NextResponse.json(
        { error: 'Error calling OpenAI API' },
        { status: response.status }
      )
    }

    const data = await response.json()
    const assistantMessage = data.choices[0].message.content

    // Check if we should escalate to WhatsApp
    const shouldEscalate = assistantMessage.includes('ESCALAR_WHATSAPP')
    const cleanMessage = assistantMessage.replace('ESCALAR_WHATSAPP', '').trim()

    return NextResponse.json({
      message: cleanMessage || 'Un agente estará en contacto pronto por WhatsApp.',
      shouldEscalate,
      tokens: {
        prompt: data.usage.prompt_tokens,
        completion: data.usage.completion_tokens,
      },
    })
  } catch (error) {
    console.error('Contact chat error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
