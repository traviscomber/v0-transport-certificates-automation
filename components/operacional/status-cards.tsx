'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react'

interface StatusCardsProps {
  blocked: number
  risk: number
  ok: number
  total: number
  compliance: number
}

export function StatusCards({ blocked, risk, ok, total, compliance }: StatusCardsProps) {
  return (
    <div className="grid grid-cols-5 gap-4">
      {/* Operativos */}
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-green-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Operativos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-700">{ok}</div>
          <p className="text-xs text-green-600 mt-1">{compliance}% cumplimiento</p>
        </CardContent>
      </Card>

      {/* En Riesgo */}
      <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-amber-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            En Riesgo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-amber-700">{risk}</div>
          <p className="text-xs text-amber-600 mt-1">próximos a vencer</p>
        </CardContent>
      </Card>

      {/* Bloqueados */}
      <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-red-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Bloqueados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-red-700">{blocked}</div>
          <p className="text-xs text-red-600 mt-1">documentos vencidos</p>
        </CardContent>
      </Card>

      {/* Ratio Riesgo */}
      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-orange-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Ratio Riesgo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-orange-700">
            {total > 0 ? Math.round((risk / total) * 100) : 0}%
          </div>
          <p className="text-xs text-orange-600 mt-1">del total</p>
        </CardContent>
      </Card>

      {/* Total */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-blue-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Total
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-700">{total}</div>
          <p className="text-xs text-blue-600 mt-1">entidades</p>
        </CardContent>
      </Card>
    </div>
  )
}
