'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, Clock, CheckCircle2, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  calculateStatusBatch,
  summarizeStatus,
  getBlockedEntities,
  getRiskEntities,
  type OperableEntity,
  type StatusSummary,
  type StatusResult
} from '@/lib/operations/status-engine'
import { generateAlertsBatch, sortAlertsByUrgency } from '@/lib/operations/alert-system'
import { AlertsDisplay } from './alerts-display'

interface ControlTowerProps {
  drivers: any[]
  subcontractors: any[]
  vehicles?: any[]
}

export function TorreControl({ drivers, subcontractors, vehicles = [] }: ControlTowerProps) {
  const [blockedList, setBlockedList] = useState<Array<[string, StatusResult, OperableEntity]>>([])
  const [riskList, setRiskList] = useState<Array<[string, StatusResult, OperableEntity]>>([])
  const [summary, setSummary] = useState<StatusSummary | null>(null)
  const [alerts, setAlerts] = useState<any[]>([])
  const [statusResults, setStatusResults] = useState<Map<string, StatusResult>>(new Map())

  useEffect(() => {
    // Combine all entities
    const allEntities: OperableEntity[] = [
      ...drivers.map(d => ({ ...d, type: 'driver' as const })),
      ...subcontractors.map(s => ({ ...s, type: 'subcontractor' as const })),
      ...vehicles.map(v => ({ ...v, type: 'vehicle' as const }))
    ]

    // Calculate status for all entities
    const results = calculateStatusBatch(allEntities)
    setStatusResults(results)
    
    // Get summary
    const summaryData = summarizeStatus(results)
    setSummary(summaryData)

    // Get blocked and risk entities
    const blocked = getBlockedEntities(results)
      .map(([id, statusResult]) => {
        const entity = allEntities.find(e => e.id === id)
        return [id, statusResult, entity] as [string, StatusResult, OperableEntity]
      })
      .filter(([_, __, entity]) => entity !== undefined)

    const risk = getRiskEntities(results)
      .map(([id, statusResult]) => {
        const entity = allEntities.find(e => e.id === id)
        return [id, statusResult, entity] as [string, StatusResult, OperableEntity]
      })
      .filter(([_, __, entity]) => entity !== undefined)

    setBlockedList(blocked)
    setRiskList(risk)

    // Generate alerts from status results
    const generatedAlerts = generateAlertsBatch(
      allEntities.map(e => ({
        id: e.id,
        nombre: e.nombre,
        type: e.type,
        blockedReasons: (results.get(e.id)?.blockedReasons || []),
        riskReasons: (results.get(e.id)?.riskReasons || []),
        score: results.get(e.id)?.score || 0
      }))
    )

    const sortedAlerts = sortAlertsByUrgency(generatedAlerts)
    setAlerts(sortedAlerts)
  }, [drivers, subcontractors, vehicles])

  if (!summary) return null

  return (
    <div className="space-y-6">
      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div>
          <AlertsDisplay alerts={alerts} />
        </div>
      )}

      {/* Header con explicación */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">Centro de Operaciones — N3uralia</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl leading-relaxed">
            Inteligencia operacional minera en tiempo real. Monitorea el estado de equipos, mantenciones pendientes, documentos críticos, repuestos en bodega y órdenes de compra que bloquean la operación.
          </p>
        </div>
      </div>

      {/* Summary Metrics con explicaciones */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-foreground">Estado Operacional de la Mina</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Total Entities */}
          <Card className="hover:border-slate-500 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Activos Totales</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total}</div>
              <p className="text-xs text-muted-foreground mt-1">Equipos + Personal + Documentos</p>
            </CardContent>
          </Card>

          {/* OK Status */}
          <Card className="border-green-200 bg-green-50/50 hover:border-green-300 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-green-900">Operativos</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{summary.ok}</div>
              <p className="text-xs text-green-600 mt-1">{summary.compliancePercentage}% en cumplimiento</p>
            </CardContent>
          </Card>

          {/* Risk Status */}
          <Card className="border-yellow-200 bg-yellow-50/50 hover:border-yellow-300 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-yellow-900">Atención Requerida</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-700">{summary.risk}</div>
              <p className="text-xs text-yellow-600 mt-1">Mantenciones, documentos, repuestos</p>
            </CardContent>
          </Card>

          {/* Blocked Status */}
          <Card className="border-red-200 bg-red-50/50 hover:border-red-300 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-red-900">Bloqueados</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700">{summary.blocked}</div>
              <p className="text-xs text-red-600 mt-1">NO pueden operar</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Compliance Score */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Índice de Cumplimiento</CardTitle>
              <CardDescription>Promedio de cumplimiento operacional</CardDescription>
            </div>
            <div className="text-3xl font-bold">{summary.averageScore}%</div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={summary.averageScore} className="h-2" />
        </CardContent>
      </Card>

      {/* Blocked Entities - Critical */}
      {blockedList.length > 0 && (
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-900">Bloqueados HOY ({blockedList.length})</CardTitle>
            </div>
            <CardDescription className="text-red-700">
              Estas entidades NO pueden operar - acción inmediata requerida
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {blockedList.map(([id, status, entity]) => (
                <div
                  key={id}
                  className="flex items-start justify-between p-3 bg-white rounded-lg border border-red-200"
                >
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{entity.nombre || entity.rut}</div>
                    <div className="text-sm text-muted-foreground mt-1">RUT: {entity.rut}</div>
                    {status.blockedReasons.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {status.blockedReasons.map((reason, idx) => (
                          <li key={idx} className="text-sm text-red-700 flex items-center gap-1">
                            <span className="text-red-600">•</span> {reason}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <Badge variant="destructive" className="ml-2 whitespace-nowrap">
                    BLOQUEADO
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk Entities - Warning */}
      {riskList.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <CardTitle className="text-yellow-900">En Riesgo ({riskList.length})</CardTitle>
            </div>
            <CardDescription className="text-yellow-700">
              Documentos próximos a vencer - requieren atención en los próximos 30 días
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {riskList.map(([id, status, entity]) => (
                <div
                  key={id}
                  className="flex items-start justify-between p-3 bg-white rounded-lg border border-yellow-200"
                >
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{entity.nombre || entity.rut}</div>
                    <div className="text-sm text-muted-foreground mt-1">RUT: {entity.rut}</div>
                    {status.riskReasons.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {status.riskReasons.map((reason, idx) => (
                          <li key={idx} className="text-sm text-yellow-700 flex items-center gap-1">
                            <span className="text-yellow-600">•</span> {reason}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <Badge variant="secondary" className="ml-2 whitespace-nowrap bg-yellow-200 text-yellow-900 hover:bg-yellow-300">
                    EN RIESGO
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Operational */}
      {blockedList.length === 0 && riskList.length === 0 && summary.ok > 0 && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <CardTitle className="text-green-900">Todo en Orden</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-green-700">
              Todas las entidades están operacionales y con documentación completa.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
