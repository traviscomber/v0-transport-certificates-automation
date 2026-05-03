import { AlertTriangle, TrendingUp, Users } from 'lucide-react'

interface ComplianceSummaryProps {
  totalConductors: number
  averageComplianceScore: number
  highRiskCount: number
  mediumRiskCount: number
  lowRiskCount: number
}

export function ComplianceSummary({
  totalConductors,
  averageComplianceScore,
  highRiskCount,
  mediumRiskCount,
  lowRiskCount,
}: ComplianceSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {/* Total Conductors */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-600 font-medium">Total Conductores</p>
            <p className="text-3xl font-bold text-blue-900 mt-2">{totalConductors}</p>
          </div>
          <Users className="w-8 h-8 text-blue-400 opacity-50" />
        </div>
      </div>

      {/* Average Compliance Score */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-green-600 font-medium">Cumplimiento Promedio</p>
            <p className="text-3xl font-bold text-green-900 mt-2">{averageComplianceScore}%</p>
          </div>
          <TrendingUp className="w-8 h-8 text-green-400 opacity-50" />
        </div>
      </div>

      {/* High Risk Count */}
      <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-red-600 font-medium">Alto Riesgo</p>
            <p className="text-3xl font-bold text-red-900 mt-2">{highRiskCount}</p>
            <p className="text-xs text-red-600 mt-1">
              {totalConductors > 0 ? Math.round((highRiskCount / totalConductors) * 100) : 0}% del total
            </p>
          </div>
          <AlertTriangle className="w-8 h-8 text-red-400 opacity-50" />
        </div>
      </div>

      {/* Medium + Low Risk */}
      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-6">
        <div>
          <p className="text-sm text-yellow-600 font-medium">Riesgo Medio/Bajo</p>
          <div className="mt-2 space-y-1">
            <p className="text-2xl font-bold text-yellow-900">
              {mediumRiskCount + lowRiskCount}
            </p>
            <p className="text-xs text-yellow-600">
              Medio: {mediumRiskCount} | Bajo: {lowRiskCount}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
