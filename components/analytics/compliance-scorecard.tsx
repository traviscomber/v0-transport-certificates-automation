import { ConductorComplianceMetrics } from '@/lib/conductor-analytics'
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react'

interface ComplianceScorecardProps {
  conductor: ConductorComplianceMetrics
}

export function ComplianceScorecard({ conductor }: ComplianceScorecardProps) {
  const getRiskColor = () => {
    switch (conductor.riskLevel) {
      case 'green':
        return 'bg-green-50 border-green-200'
      case 'yellow':
        return 'bg-yellow-50 border-yellow-200'
      case 'red':
        return 'bg-red-50 border-red-200'
    }
  }

  const getRiskBadgeColor = () => {
    switch (conductor.riskLevel) {
      case 'green':
        return 'bg-green-100 text-green-800'
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800'
      case 'red':
        return 'bg-red-100 text-red-800'
    }
  }

  return (
    <div className={`border rounded-lg p-6 ${getRiskColor()}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{conductor.conductorName}</h3>
          <p className="text-sm text-gray-600">{conductor.rut}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskBadgeColor()}`}>
          {conductor.riskLevel === 'green' ? 'Bajo Riesgo' : conductor.riskLevel === 'yellow' ? 'Riesgo Medio' : 'Alto Riesgo'}
        </span>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Cumplimiento</span>
          <span className="text-2xl font-bold text-gray-900">{conductor.complianceScore}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              conductor.riskLevel === 'green'
                ? 'bg-green-500'
                : conductor.riskLevel === 'yellow'
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
            }`}
            style={{ width: `${conductor.complianceScore}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-xs text-gray-600">Aprobados</p>
            <p className="text-lg font-semibold text-gray-900">{conductor.approvedDocuments}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <XCircle className="w-5 h-5 text-red-600" />
          <div>
            <p className="text-xs text-gray-600">Rechazados</p>
            <p className="text-lg font-semibold text-gray-900">{conductor.rejectedDocuments}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-yellow-600" />
          <div>
            <p className="text-xs text-gray-600">Pendientes</p>
            <p className="text-lg font-semibold text-gray-900">{conductor.pendingDocuments}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-600" />
          <div>
            <p className="text-xs text-gray-600">Por Vencer</p>
            <p className="text-lg font-semibold text-gray-900">{conductor.expiringDocuments}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Confianza IA Promedio</span>
          <span className="font-semibold text-gray-900">{(conductor.averageAiConfidence * 100).toFixed(0)}%</span>
        </div>
      </div>
    </div>
  )
}
