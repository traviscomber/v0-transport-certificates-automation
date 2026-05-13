import { Metadata } from 'next'
import { AIInsightsDashboard } from '@/components/ai-insights-dashboard'

export const metadata: Metadata = {
  title: 'AI Insights - Document Analysis',
  description: 'Analyze document recognition patterns and model accuracy',
}

export default function AIInsightsPage() {
  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">AI Model Insights</h1>
          <p className="text-slate-400">Analyze document recognition patterns and improve model accuracy</p>
        </div>
        
        <AIInsightsDashboard />
      </div>
    </div>
  )
}
