import { NextRequest, NextResponse } from 'next/server'

interface AnalysisRequest {
  data: any[]
  stats: any
  reportType: 'compliance' | 'risk' | 'summary' | 'alerts'
  language?: 'es' | 'en'
}

async function analyzeWithOpenAI(prompt: string) {
  const apiKey = process.env.OPENAI_API_KEY
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured')
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Eres un analista de cumplimiento normativo especializado en transporte. Proporciona análisis profundos, prácticos y accionables en español. Sé conciso pero exhaustivo.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    })
  })

  if (!response.ok) {
    const error = await response.json()
    console.error('[v0] OpenAI API error:', error)
    throw new Error(`OpenAI API error: ${error.error?.message}`)
  }

  const result = await response.json()
  return result.choices[0].message.content
}

export async function POST(request: NextRequest) {
  try {
    const { data, stats, reportType = 'summary', language = 'es' } = await request.json() as AnalysisRequest

    console.log('[v0] Analyzing report:', { type: reportType, dataPoints: data.length })

    let prompt = ''

    if (reportType === 'compliance') {
      const activos = data.filter(d => d.is_active).length
      const conDocumentos = data.filter(d => d.documentCount > 0).length
      
      prompt = `Analiza el cumplimiento documental de transportistas y conductores:
        - Total: ${stats.total}
        - Activos: ${activos}
        - Con documentos: ${conDocumentos}
        - Sin documentos: ${stats.sinDocumentos}
        
        Categorías representadas: ${[...new Set(data.map(d => d.category))].join(', ')}
        
        Proporciona:
        1. Análisis del estado actual de cumplimiento
        2. Brechas críticas identificadas
        3. Áreas de riesgo inmediato
        4. Recomendaciones prioritarias`
    } else if (reportType === 'risk') {
      prompt = `Analiza los riesgos de cumplimiento normativo basado en:
        - Total registros: ${stats.total}
        - Inactivos: ${stats.inactivos}
        - Sin documentación: ${stats.sinDocumentos}
        
        Identifica:
        1. Riesgos críticos (alta probabilidad + alto impacto)
        2. Riesgos moderados
        3. Factores de mitigación existentes
        4. Plan de acción recomendado`
    } else if (reportType === 'alerts') {
      prompt = `Genera alertas operacionales basado en:
        - Registros inactivos: ${stats.inactivos}
        - Sin documentos: ${stats.sinDocumentos}
        - Tasa de documentación: ${((stats.conDocumentos / stats.total) * 100).toFixed(1)}%
        
        Enumera las alertas más críticas en orden de urgencia.`
    } else {
      // summary
      prompt = `Proporciona un resumen ejecutivo del estado de cumplimiento normativo:
        - Total de registros: ${stats.total}
        - Activos: ${stats.activos} (${((stats.activos/stats.total)*100).toFixed(1)}%)
        - Con documentación: ${stats.conDocumentos} (${((stats.conDocumentos/stats.total)*100).toFixed(1)}%)
        
        Incluye: estado general, métricas clave, hallazgos principales y recomendaciones ejecutivas.`
    }

    console.log('[v0] Sending to OpenAI...')
    const analysis = await analyzeWithOpenAI(prompt)
    console.log('[v0] Analysis completed successfully')

    return NextResponse.json({
      success: true,
      analysis,
      reportType,
      generatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('[v0] Error generating analysis:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate analysis' },
      { status: 500 }
    )
  }
}
