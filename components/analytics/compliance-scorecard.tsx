import { ConductorComplianceMetrics } from '@/lib/conductor-analytics'
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react'

interface ComplianceScorecardProps {
  conductor: ConductorComplianceMetrics
}

export function ComplianceScorecard({ conductor }: ComplianceScorecardProps) {
  const getRiskColor = () => {
    switch (conductor.riskLevel) {
      case 'green':
        return 'bg-green-500 border-green-600'
      case 'yellow':
        return 'bg-yellow-500 border-yellow-600'
      case 'red':
        return 'bg-red-500 border-red-600'
    }
  }

  const getRiskBadgeColor = () => {
    switch (conductor.riskLevel) {
      case 'green':
        return 'bg-green-600 text-white'
      case 'yellow':
        return 'bg-yellow-600 text-white'
      case 'red':
        return 'bg-red-600 text-white'
    }
  }

  return (
    <div className={`border rounded-lg p-6 ${getRiskColor()}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{conductor.conductorName}</h3>
          <p className="text-sm text-gray-100">{conductor.rut}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskBadgeColor()}`}>
          {conductor.riskLevel === 'green' ? 'Bajo Riesgo' : conductor.riskLevel === 'yellow' ? 'Riesgo Medio' : 'Alto Riesgo'}
        </span>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-white">Cumplimiento</span>
          <span className="text-2xl font-bold text-white">{conductor.complianceScore}%</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              conductor.riskLevel === 'green'
                ? 'bg-white'
                : conductor.riskLevel === 'yellow'
                  ? 'bg-white'
                  : 'bg-white'
            }`}
            style={{ width: `${conductor.complianceScore}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-white" />
          <div>
            <p className="text-xs text-gray-100">Aprobados</p>
            <p className="text-lg font-semibold text-white">{conductor.approvedDocuments}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <XCircle className="w-5 h-5 text-white" />
          <div>
            <p className="text-xs text-gray-100">Rechazados</p>
            <p className="text-lg font-semibold text-white">{conductor.rejectedDocuments}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-white" />
          <div>
            <p className="text-xs text-gray-100">Pendientes</p>
            <p className="text-lg font-semibold text-white">{conductor.pendingDocuments}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-white" />
          <div>
            <p className="text-xs text-gray-100">Por Vencer</p>
            <p className="text-lg font-semibold text-white">{conductor.expiringDocuments}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/20">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-100">Confianza IA Promedio</span>
          <span className="font-semibold text-white">{(conductor.averageAiConfidence * 100).toFixed(0)}%</span>
        </div>
      </div>
    </div>
  )
}
