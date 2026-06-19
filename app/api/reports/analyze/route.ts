import { NextRequest, NextResponse } from 'next/server'

interface AnalysisRequest {
  data: any[]
  stats: any
  reportType: 'compliance' | 'risk' | 'summary' | 'alerts'
  language?: 'es' | 'en'
  periodLabel?: string
}

const SYSTEM_PROMPT = `Eres un analista senior de cumplimiento normativo especializado en transporte y logística. 
Tu rol es proporcionar análisis profundos, accionables y basados en datos. 
Comunica de forma clara, profesional y en español.
Estructura tus respuestas de manera que sea fácil para ejecutivos tomar decisiones.`

const percent = (part: number, total: number) => total > 0 ? ((part / total) * 100).toFixed(1) : '0.0'

const REPORT_TEMPLATES = {
  compliance: (stats: any, data: any[], periodLabel: string) => `
ANÁLISIS DE CUMPLIMIENTO NORMATIVO
Período: ${periodLabel}

DATOS GENERALES:
- Total de registros: ${stats.total}
- Registros activos: ${stats.activos} (${percent(stats.activos, stats.total)}%)
- Documentación completa: ${stats.conDocumentos} (${percent(stats.conDocumentos, stats.total)}%)
- Registros sin documentación: ${stats.sinDocumentos} (${percent(stats.sinDocumentos, stats.total)}%)
- Conductores: ${data.filter(d => d.type === 'driver').length}
- Subcontratistas: ${data.filter(d => d.type === 'subcontractor').length}

Proporciona un análisis que incluya:
1. **Estado Actual de Cumplimiento**: Evaluación general y métricas clave
2. **Brechas Identificadas**: Áreas donde no se cumple con requisitos normativo
3. **Riesgos Críticos**: Potencial impacto en operaciones
4. **Recomendaciones Prioritarias**: Acciones inmediatas para mejorar cumplimiento
5. **Cronograma Sugerido**: Timeline para implementación de mejoras`,

  risk: (stats: any, data: any[], periodLabel: string) => `
ANÁLISIS DE RIESGOS DE CUMPLIMIENTO
Período: ${periodLabel}
Nivel de Riesgo General: ${(stats.total > 0 && (stats.sinDocumentos / stats.total) * 100 > 30 ? 'ALTO' : stats.total > 0 && (stats.sinDocumentos / stats.total) * 100 > 10 ? 'MEDIO' : 'BAJO')}

INDICADORES DE RIESGO:
- Tasa de documentación incompleta: ${percent(stats.sinDocumentos, stats.total)}%
- Registros inactivos con documentación pendiente: ${stats.inactivos}
- Proporción documentos rechazados: ${stats.rejected || 0}

Análisis solicitado:
1. **Riesgos Críticos (Máxima Prioridad)**
   - Identifica los riesgos que podrían resultar en sanciones inmediatas
   - Estimado de impacto operacional y financiero

2. **Riesgos Moderados (Mediano Plazo)**
   - Riesgos emergentes que requieren atención en 30-60 días
   - Factores que podrían escalar su gravedad

3. **Matriz de Riesgo**
   - Probabilidad vs. Impacto
   - Priorización para mitigación

4. **Plan de Mitigación**
   - Controles recomendados por riesgo
   - Responsables sugeridos
   - Cronograma de implementación`,

  alerts: (stats: any, data: any[], periodLabel: string) => `
ALERTAS OPERACIONALES CRÍTICAS
Generado: ${new Date().toLocaleDateString('es-ES')}
Período: ${periodLabel}

SITUACIÓN ACTUAL:
- Registros sin documentación: ${stats.sinDocumentos} (${percent(stats.sinDocumentos, stats.total)}%)
- Documentos pendientes de revisión: ${stats.pending || 0}
- Registros rechazados requiriendo acción: ${stats.rejected || 0}
- Documentos próximos a vencer: ${stats.expiring || 0}

Genera una lista de alertas en orden de urgencia:
1. **CRÍTICA** - Requiere acción en las próximas 24 horas
2. **ALTA** - Requiere acción en los próximos 3 días
3. **MEDIA** - Requiere atención en la próxima semana
4. **BAJA** - Monitoreo recomendado

Para cada alerta incluye:
- Descripción clara del problema
- Impacto potencial
- Acción recomendada
- Propietario/responsable sugerido`,

  summary: (stats: any, data: any[], periodLabel: string) => `
RESUMEN EJECUTIVO DE CUMPLIMIENTO
Fecha de Reporte: ${new Date().toLocaleDateString('es-ES')}
Período: ${periodLabel}

MÉTRICAS PRINCIPALES:
- Total de registros en sistema: ${stats.total}
- Tasa de cumplimiento: ${percent(stats.conDocumentos, stats.total)}%
- Documentos aprobados: ${stats.approved || 0}
- Documentos en revisión: ${stats.pending || 0}
- Documentos rechazados: ${stats.rejected || 0}
- Tasa de actividad: ${percent(stats.activos, stats.total)}%

Por favor proporciona:
1. **Situación Actual** (2-3 párrafos)
   - Estado general del cumplimiento
   - Tendencias principales
   - Comparativa con períodos anteriores si es posible

2. **Logros Destacados**
   - Áreas donde se ha mejorado
   - Iniciativas que han funcionado bien

3. **Desafíos Principales**
   - Obstáculos para mejorar cumplimiento
   - Factores que impiden documentación completa

4. **Recomendaciones Ejecutivas**
   - Top 3 acciones prioritarias
   - Recursos necesarios
   - Impacto esperado

5. **Próximos Pasos**
   - Plan de acción de 30 días
   - Métricas a monitorear`
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalysisRequest = await request.json()
    const { data, stats, reportType = 'summary', language = 'es', periodLabel = 'Período seleccionado' } = body

    if (!reportType || !REPORT_TEMPLATES[reportType]) {
      return NextResponse.json(
        { error: 'Tipo de reporte inválido' },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.error('[v0] ❌ OPENAI_API_KEY not configured')
      return NextResponse.json(
        { error: 'API key no configurada' },
        { status: 500 }
      )
    }

    console.log('[v0] Analyzing report:', { type: reportType, dataPoints: data?.length || 0 })

    const template = REPORT_TEMPLATES[reportType] as (s: any, d: any[], p: string) => string
    const prompt = template(stats, data || [], periodLabel)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('[v0] ❌ OpenAI API error:', error)
      return NextResponse.json(
        { 
          error: 'Error generando análisis',
          details: error.error?.message || 'Error desconocido'
        },
        { status: response.status }
      )
    }

    const result = await response.json()
    const analysisText = result.choices[0]?.message?.content || ''

    console.log('[v0] ✅ Analysis generated successfully for', reportType)

    return NextResponse.json({
      success: true,
      analysis: analysisText,
      reportType,
      generatedAt: new Date().toISOString(),
      tokensUsed: result.usage?.total_tokens,
    })
  } catch (error) {
    console.error('[v0] ❌ Error generating analysis:', error)
    return NextResponse.json(
      { 
        error: 'Error generando análisis',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}


