'use client'

import { Card } from '@/components/ui/card'
import { Users, CheckCircle2, AlertCircle, FileText } from 'lucide-react'

interface ReportStatsProps {
  stats: {
    total: number
    activos: number
    inactivos: number
    conDocumentos: number
    sinDocumentos: number
  }
}

export function ReportStats({ stats }: ReportStatsProps) {
  const complianceRate = stats.total > 0 ? ((stats.conDocumentos / stats.total) * 100).toFixed(1) : 0
  const activityRate = stats.total > 0 ? ((stats.activos / stats.total) * 100).toFixed(1) : 0

  const statCards = [
    {
      title: 'Total de Registros',
      value: stats.total.toString(),
      icon: Users,
      color: 'bg-blue-100 text-blue-700',
      description: 'Conductores y Subcontratistas'
    },
    {
      title: 'Tasa de Actividad',
      value: `${activityRate}%`,
      icon: CheckCircle2,
      color: 'bg-green-100 text-green-700',
      description: `${stats.activos} registros activos`
    },
    {
      title: 'Cumplimiento Documental',
      value: `${complianceRate}%`,
      icon: FileText,
      color: 'bg-purple-100 text-purple-700',
      description: `${stats.conDocumentos} con documentos`
    },
    {
      title: 'En Riesgo',
      value: stats.sinDocumentos.toString(),
      icon: AlertCircle,
      color: 'bg-red-100 text-red-700',
      description: 'Sin documentación completa'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-2">{stat.description}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
