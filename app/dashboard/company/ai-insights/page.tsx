import { Metadata } from 'next'
import { AIInsightsDashboard } from '@/components/ai-insights-dashboard'

export const metadata: Metadata = {
  title: 'Inteligencia IA | ChileFlota',
  description: 'Evidencia operativa del análisis documental asistido por IA',
}

export default function AIInsightsPage() {
  return (
    <div className="space-y-6">
      <div className="max-w-3xl">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-[var(--cf-text-muted)]">
          Inteligencia documental
        </p>
        <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--cf-text)] md:text-[28px]">
          Evidencia del análisis IA
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--cf-text-secondary)]">
          Cobertura, confianza reportada y señales observadas del procesamiento documental. Estas métricas no sustituyen la revisión humana ni se presentan como exactitud certificada.
        </p>
      </div>

      <AIInsightsDashboard />
    </div>
  )
}
