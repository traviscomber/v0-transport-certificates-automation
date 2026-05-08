
'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { ComplianceChecker } from '@/lib/validation/document-requirements'
import { AlertCircle, CheckCircle, Clock, FileText, AlertTriangle } from 'lucide-react'

interface DocumentStatus {
  id: string
  code: string
  name: string
  category: string
  periodicity: string
  status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'expired'
  submissionDate: string | null
  expiryDate: string | null
  daysUntilExpiry: number | null
  rejectionReason: string | null
}

interface ComplianceDashboard {
  conductorId: string
  onboardingComplete?: boolean
}

export function ConductorComplianceDashboard({ conductorId, onboardingComplete = false }: ComplianceDashboard) {
  const [documents, setDocuments] = useState<DocumentStatus[]>([])
  const [complianceScore, setComplianceScore] = useState(0)
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('medium')
  const [loading, setLoading] = useState(true)

  // Fetch conductor requirements and compliance status
  const fetcher = async () => {
    try {
      const response = await fetch('/api/compliance/conductor-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conductorId }),
      })
      const data = await response.json()
      return data
    } catch (error) {
      console.error('[v0] Error fetching compliance status:', error)
      return null
    }
  }

  const { data: complianceData, isLoading } = useSWR(`/compliance/${conductorId}`, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  useEffect(() => {
    if (complianceData) {
      setDocuments(complianceData.documents || [])
      setComplianceScore(complianceData.complianceScore?.score || 0)
      setRiskLevel(complianceData.complianceScore?.riskLevel || 'medium')
      setLoading(false)
    }
  }, [complianceData])

  const statusCounts = {
    pending: documents.filter((d) => d.status === 'pending').length,
    approved: documents.filter((d) => d.status === 'approved').length,
    expired: documents.filter((d) => d.status === 'expired').length,
    rejected: documents.filter((d) => d.status === 'rejected').length,
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-green-50 border-green-200'
      case 'medium':
        return 'bg-yellow-50 border-yellow-200'
      case 'high':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'pending':
        return <Clock className="w-5 h-5 text-blue-600" />
      case 'expired':
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      case 'rejected':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      default:
        return <FileText className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Aprobado' },
      pending: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Pendiente' },
      expired: { bg: 'bg-red-100', text: 'text-red-800', label: 'Vencido' },
      rejected: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Rechazado' },
    }
    const badge = badges[status] || badges.pending
    return <span className={`${badge.bg} ${badge.text} px-3 py-1 rounded-full text-sm font-medium`}>{badge.label}</span>
  }

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin">
          <div className="h-8 w-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Compliance Score Card */}
      <div className={`border rounded-lg p-6 ${getRiskColor(riskLevel)}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Estado de Cumplimiento</h2>
          <span className="text-3xl font-bold">{complianceScore}%</span>
        </div>
        <p className="text-sm mb-4">
          {statusCounts.approved} de {documents.length} documentos aprobados
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className={`h-2 rounded-full transition-all ${riskLevel === 'high' ? 'bg-red-600' : riskLevel === 'medium' ? 'bg-yellow-600' : 'bg-green-600'}`} style={{ width: `${complianceScore}%` }}></div>
        </div>
        {statusCounts.expired > 0 && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded text-red-800 text-sm">
            {statusCounts.expired} documento{statusCounts.expired !== 1 ? 's' : ''} vencido{statusCounts.expired !== 1 ? 's' : ''}
          </div>
        )}
        {statusCounts.rejected > 0 && (
          <div className="mt-2 p-3 bg-orange-100 border border-orange-300 rounded text-orange-800 text-sm">
            {statusCounts.rejected} documento{statusCounts.rejected !== 1 ? 's' : ''} rechazado{statusCounts.rejected !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Document Categories */}
      <div className="space-y-4">
        {['conductor', 'company', 'vehicle'].map((category) => {
          const categoryDocs = documents.filter((d) => d.category === category)
          if (categoryDocs.length === 0) return null

          const categoryNames: Record<string, string> = {
            conductor: 'Documentos Personales',
            company: 'Documentos de la Empresa',
            vehicle: 'Documentos del Vehículo',
          }

          return (
            <div key={category}>
              <h3 className="text-lg font-semibold mb-3">{categoryNames[category]}</h3>
              <div className="grid gap-3">
                {categoryDocs.map((doc) => (
                  <div key={doc.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getStatusIcon(doc.status)}
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{doc.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Periodicidad: {doc.periodicity === 'once' ? 'Una vez' : doc.periodicity === 'monthly' ? 'Mensual' : doc.periodicity === 'annual' ? 'Anual' : doc.periodicity === 'triennial' ? 'Trienal' : doc.periodicity === 'biennial' ? 'Bienal' : 'Según sea necesario'}
                          </p>
                          {doc.daysUntilExpiry !== null && doc.daysUntilExpiry <= 30 && (
                            <p className="text-sm text-orange-600 mt-1">
                              Vence en {doc.daysUntilExpiry} días
                            </p>
                          )}
                          {doc.rejectionReason && (
                            <p className="text-sm text-red-600 mt-2">
                              Razón del rechazo: {doc.rejectionReason}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(doc.status)}
                        {doc.status === 'pending' && (
                          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">Subir documento</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{statusCounts.pending}</div>
          <div className="text-sm text-blue-800 mt-1">Pendientes</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{statusCounts.approved}</div>
          <div className="text-sm text-green-800 mt-1">Aprobados</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{statusCounts.rejected}</div>
          <div className="text-sm text-orange-800 mt-1">Rechazados</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{statusCounts.expired}</div>
          <div className="text-sm text-red-800 mt-1">Vencidos</div>
        </div>
      </div>
    </div>
  )
}
