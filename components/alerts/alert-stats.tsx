'use client'

import { Card } from '@/components/ui/card'
import { AlertTriangle, AlertCircle, CheckCircle, Bell } from 'lucide-react'

interface AlertStatsProps {
  total: number
  warnings: number
  errors: number
  info: number
  unread: number
}

export function AlertStats({ total, warnings, errors, info, unread }: AlertStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Total de Alertas</p>
            <p className="text-2xl font-bold">{total}</p>
          </div>
          <Bell className="w-8 h-8 text-blue-500 opacity-20" />
        </div>
      </Card>

      <Card className="p-4 border-red-200 bg-red-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Errores</p>
            <p className="text-2xl font-bold text-red-600">{errors}</p>
          </div>
          <AlertCircle className="w-8 h-8 text-red-500 opacity-20" />
        </div>
      </Card>

      <Card className="p-4 border-orange-200 bg-orange-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Advertencias</p>
            <p className="text-2xl font-bold text-orange-600">{warnings}</p>
          </div>
          <AlertTriangle className="w-8 h-8 text-orange-500 opacity-20" />
        </div>
      </Card>

      <Card className="p-4 border-green-200 bg-green-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Información</p>
            <p className="text-2xl font-bold text-green-600">{info}</p>
          </div>
          <CheckCircle className="w-8 h-8 text-green-500 opacity-20" />
        </div>
      </Card>

      <Card className="p-4 border-purple-200 bg-purple-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">No Leídas</p>
            <p className="text-2xl font-bold text-purple-600">{unread}</p>
          </div>
          <Bell className="w-8 h-8 text-purple-500 opacity-20" />
        </div>
      </Card>
    </div>
  )
}
