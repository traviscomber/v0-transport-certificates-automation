'use client'

import { AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RiskLevel, getRiskColor } from '@/lib/risk-matrix-calculator'

interface RiskItem {
  id: string
  name: string
  type: 'conductor' | 'transportista'
  riskLevel: RiskLevel
  score: number
  issues: string[]
  description: string
  href: string
}

interface RiskMatrixProps {
  items: RiskItem[]
  loading?: boolean
}

export function RiskMatrix({ items, loading }: RiskMatrixProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Matriz de Riesgos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Agrupar por nivel de riesgo
  const itemsByRisk = {
    ROJO: items.filter(i => i.riskLevel === 'ROJO'),
    AMARILLO: items.filter(i => i.riskLevel === 'AMARILLO'),
    VERDE: items.filter(i => i.riskLevel === 'VERDE'),
  }

  return (
    <div className="space-y-6">
      {/* Resumen de Riesgos */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#71717A]">Crítico (Rojo)</p>
                <p className="text-3xl font-bold text-red-600">{itemsByRisk.ROJO.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#71717A]">Moderado (Amarillo)</p>
                <p className="text-3xl font-bold text-yellow-600">{itemsByRisk.AMARILLO.length}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#71717A]">Compliant (Verde)</p>
                <p className="text-3xl font-bold text-green-600">{itemsByRisk.VERDE.length}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Matriz Detallada */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle de Riesgos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Crítico */}
            {itemsByRisk.ROJO.length > 0 && (
              <div>
                <h3 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  Crítico - Acción Inmediata Requerida
                </h3>
                <div className="space-y-2">
                  {itemsByRisk.ROJO.map(item => (
                    <RiskItemCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {/* Moderado */}
            {itemsByRisk.AMARILLO.length > 0 && (
              <div>
                <h3 className="font-semibold text-yellow-700 mb-3 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  Moderado - Requiere Atención
                </h3>
                <div className="space-y-2">
                  {itemsByRisk.AMARILLO.map(item => (
                    <RiskItemCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {/* Compliant */}
            {itemsByRisk.VERDE.length > 0 && (
              <div>
                <h3 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  Operativo - Compliant
                </h3>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {itemsByRisk.VERDE.map(item => (
                    <RiskItemCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {items.length === 0 && (
              <p className="text-center text-[#71717A] py-8">No hay registros para evaluar</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function RiskItemCard({ item }: { item: RiskItem }) {
  const colors = getRiskColor(item.riskLevel)

  return (
    <a href={item.href} className="block">
      <div className={`rounded-lg border p-3 ${colors.border} ${colors.bg} hover:shadow-md transition-shadow cursor-pointer`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className={`font-medium ${colors.text}`}>{item.name}</p>
            <p className="text-xs text-[#71717A] mt-1">{item.description}</p>
            {item.issues.length > 0 && (
              <ul className="text-xs mt-2 space-y-1">
                {item.issues.map((issue, idx) => (
                  <li key={idx} className="text-[#71717A]">
                    • {issue}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="text-right">
            <Badge variant="outline" className={colors.text}>
              Score: {item.score}
            </Badge>
            <p className="text-xs text-[#71717A] mt-1 capitalize">{item.type}</p>
          </div>
        </div>
      </div>
    </a>
  )
}
