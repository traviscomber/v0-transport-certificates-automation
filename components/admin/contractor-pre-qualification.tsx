'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ContractorQualificationResult, getQualificationStats } from "@/lib/contractor-pre-qualification"
import { CheckCircle2, AlertCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

interface ContractorPreQualificationProps {
  results: ContractorQualificationResult[]
}

export function ContractorPreQualification({ results }: ContractorPreQualificationProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const stats = getQualificationStats(results)

  const getStatusIcon = (status: 'green' | 'yellow' | 'red') => {
    switch (status) {
      case 'green':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case 'yellow':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      case 'red':
        return <XCircle className="h-5 w-5 text-red-600" />
    }
  }

  const getStatusColor = (status: 'green' | 'yellow' | 'red') => {
    switch (status) {
      case 'green':
        return 'bg-green-50 border-green-200'
      case 'yellow':
        return 'bg-yellow-50 border-yellow-200'
      case 'red':
        return 'bg-red-50 border-red-200'
    }
  }

  const getStatusLabel = (status: 'green' | 'yellow' | 'red') => {
    switch (status) {
      case 'green':
        return 'Puede operar'
      case 'yellow':
        return 'Requiere atención'
      case 'red':
        return 'No puede operar'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pre-calificación de Contratistas</CardTitle>
          <CardDescription>
            Score de cumplimiento para operación. Verde: puede operar, Amarillo: revisar, Rojo: no habilitado
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Stats Summary */}
          <div className="grid gap-4 mb-6 md:grid-cols-5">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="text-sm text-green-700">Habilitados</p>
              <p className="text-2xl font-bold text-green-600">{stats.green}</p>
            </div>
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <p className="text-sm text-yellow-700">Revisar</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.yellow}</p>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700">No habilitados</p>
              <p className="text-2xl font-bold text-red-600">{stats.red}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Score promedio</p>
              <p className="text-2xl font-bold">{stats.averageScore}%</p>
            </div>
          </div>

          {/* Contractor List */}
          <div className="space-y-3">
            {results.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay contratistas para calificar
              </div>
            ) : (
              results.map((result) => (
                <div
                  key={result.contractorId}
                  className={`rounded-lg border p-4 ${getStatusColor(result.status)}`}
                >
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() =>
                      setExpandedId(
                        expandedId === result.contractorId
                          ? null
                          : result.contractorId
                      )
                    }
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {getStatusIcon(result.status)}
                      <div className="flex-1">
                        <p className="font-semibold">{result.contractorName}</p>
                        <p className="text-sm text-muted-foreground">
                          {getStatusLabel(result.status)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                result.status === 'green'
                                  ? 'bg-green-600'
                                  : result.status === 'yellow'
                                  ? 'bg-yellow-600'
                                  : 'bg-red-600'
                              }`}
                              style={{
                                width: `${result.percentage}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-semibold w-10">
                            {result.percentage}%
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {result.score}/{result.maxScore}
                        </p>
                      </div>
                      {expandedId === result.contractorId ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedId === result.contractorId && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                      {/* Checklist */}
                      <div>
                        <p className="font-semibold text-sm mb-3">Checklist de Requisitos</p>
                        <div className="grid gap-2 md:grid-cols-2">
                          {Object.entries(result.checklist).map(([key, value]) => (
                            <div key={key} className="flex items-center gap-2 text-sm">
                              {value ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                              )}
                              <span>
                                {key
                                  .replace(/([A-Z])/g, ' $1')
                                  .toLowerCase()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Failed Requirements */}
                      {result.failedRequirements.length > 0 && (
                        <div>
                          <p className="font-semibold text-sm mb-2 text-red-600">
                            Requisitos incumplidos
                          </p>
                          <ul className="space-y-1">
                            {result.failedRequirements.map((req, i) => (
                              <li key={i} className="text-sm flex items-center gap-2">
                                <span className="text-red-600">•</span>
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Recommendations */}
                      {result.recommendations.length > 0 && (
                        <div>
                          <p className="font-semibold text-sm mb-2">Recomendaciones</p>
                          <ul className="space-y-1">
                            {result.recommendations.map((rec, i) => (
                              <li key={i} className="text-sm flex items-center gap-2">
                                <span className="text-blue-600">→</span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Action Button */}
                      <div className="pt-2">
                        <Link
                          href={`/admin/transportistas`}
                          className="text-sm text-primary hover:underline"
                        >
                          Ver detalles del transportista →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
