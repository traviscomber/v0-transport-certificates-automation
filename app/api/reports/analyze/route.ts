import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-middleware'

interface AnalysisRequest {
  data?: Array<{ type?: string }>
  stats?: {
    total?: number
    approved?: number
    pending?: number
    rejected?: number
    expired?: number
    expiring?: number
    entities?: number
  }
  reportType?: 'compliance' | 'risk' | 'summary' | 'alerts'
  language?: 'es' | 'en'
  periodLabel?: string
}

const SYSTEM_PROMPT = `Eres un analista senior de cumplimiento operacional para transporte y logística.
Trabaja únicamente con los indicadores entregados. No inventes hechos, sanciones, probabilidades, montos, tendencias, causas ni comparaciones históricas que no estén presentes.
Distingue siempre dato observado, interpretación y recomendación. No presentes una recomendación como obligación normativa.
Comunica de forma breve, profesional y en español, orientado a una ejecutiva que debe decidir la siguiente acción.`

const percent = (part: number, total: number) => (total > 0 ? ((part / total) * 100).toFixed(1) : '0.0')

function normalizedStats(input: AnalysisRequest['stats']) {
  return {
    total: Number(input?.total || 0),
    approved: Number(input?.approved || 0),
    pending: Number(input?.pending || 0),
    rejected: Number(input?.rejected || 0),
    expired: Number(input?.expired || 0),
    expiring: Number(input?.expiring || 0),
    entities: Number(input?.entities || 0),
  }
}

function buildPrompt(reportType: NonNullable<AnalysisRequest['reportType']>, stats: ReturnType<typeof normalizedStats>, periodLabel: string) {
  const observed = `
PERÍODO: ${periodLabel}
INDICADORES OBSERVADOS:
- Documentos: ${stats.total}
- Aprobados: ${stats.approved} (${percent(stats.approved, stats.total)}%)
- Pendientes: ${stats.pending} (${percent(stats.pending, stats.total)}%)
- Rechazados: ${stats.rejected} (${percent(stats.rejected, stats.total)}%)
- Vencidos: ${stats.expired}
- Por vencer dentro de 30 días: ${stats.expiring}
- Entidades observadas: ${stats.entities}
`

  if (reportType === 'compliance') {
    return `${observed}
Entrega: 1) estado observado, 2) brechas visibles en estos indicadores, 3) evidencia que falta para concluir cumplimiento, 4) tres acciones priorizadas. No declares cumplimiento integral si la cobertura obligatoria no está demostrada.`
  }

  if (reportType === 'risk') {
    return `${observed}
Entrega: 1) excepciones operacionales observadas, 2) priorización por urgencia documental, 3) impacto operacional plausible expresado como hipótesis, 4) acciones de mitigación. No inventes probabilidad, impacto financiero ni sanciones.`
  }

  if (reportType === 'alerts') {
    return `${observed}
Ordena alertas sólo a partir de vencidos, próximos a vencer, rechazados y pendientes. Para cada grupo indica razón observable, prioridad operativa y siguiente acción. No asignes responsables nominales que no estén en los datos.`
  }

  return `${observed}
Entrega un resumen ejecutivo de máximo 300 palabras: situación observada, principales excepciones, tres prioridades y qué evidencia faltaría para una conclusión más fuerte. No inventes tendencias ni comparaciones con períodos anteriores.`
}

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await verifyAuth(request)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: AnalysisRequest = await request.json()
    const reportType = body.reportType || 'summary'
    const periodLabel = typeof body.periodLabel === 'string' && body.periodLabel.trim()
      ? body.periodLabel.trim().slice(0, 120)
      : 'Período seleccionado'

    if (!['compliance', 'risk', 'summary', 'alerts'].includes(reportType)) {
      return NextResponse.json({ error: 'Tipo de reporte inválido' }, { status: 400 })
    }

    const stats = normalizedStats(body.stats)
    if (!Number.isFinite(stats.total) || stats.total < 0) {
      return NextResponse.json({ error: 'Indicadores inválidos' }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.error('[reports/analyze] OPENAI_API_KEY not configured')
      return NextResponse.json({ error: 'Servicio de análisis no configurado' }, { status: 503 })
    }

    const prompt = buildPrompt(reportType, stats, periodLabel)
    const model = process.env.OPENAI_REPORT_MODEL || 'gpt-4o-mini'

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 1400,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[reports/analyze] OpenAI request failed:', response.status, errorText.slice(0, 300))
      return NextResponse.json({ error: 'Error generando análisis' }, { status: 502 })
    }

    const result = await response.json()
    const analysisText = result.choices?.[0]?.message?.content || ''

    if (!analysisText) {
      return NextResponse.json({ error: 'El análisis no devolvió contenido' }, { status: 502 })
    }

    return NextResponse.json({
      success: true,
      analysis: analysisText,
      reportType,
      generatedAt: new Date().toISOString(),
      model,
    })
  } catch (error) {
    console.error('[reports/analyze] Error:', error)
    return NextResponse.json({ error: 'Error generando análisis' }, { status: 500 })
  }
}
