'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock } from 'lucide-react'

interface ExpirationItem {
  id: string
  entity: string
  document: string
  daysRemaining: number
  expiryDate: string
  priority: 'urgent' | 'soon' | 'upcoming'
}

interface UpcomingExpirationsProps {
  items: ExpirationItem[]
}

export function UpcomingExpirations({ items }: UpcomingExpirationsProps) {
  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'urgent': return 'bg-red-50 border-l-red-600'
      case 'soon': return 'bg-amber-50 border-l-amber-600'
      default: return 'bg-blue-50 border-l-blue-600'
    }
  }

  const getPriorityBadge = (days: number) => {
    if (days <= 3) return { label: 'URGENTE', color: 'bg-red-600' }
    if (days <= 7) return { label: 'PRONTO', color: 'bg-amber-600' }
    if (days <= 15) return { label: 'PRÓXIMO', color: 'bg-blue-600' }
    return { label: 'DENTRO 30D', color: 'bg-green-600' }
  }

  const sorted = [...items].sort((a, b) => a.daysRemaining - b.daysRemaining).slice(0, 12)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Próximos vencimientos ({items.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <p className="text-gray-500 text-sm py-4">No hay vencimientos próximos</p>
        ) : (
          <div className="space-y-2">
            {sorted.map(item => {
              const badge = getPriorityBadge(item.daysRemaining)
              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-lg border-l-4 ${getPriorityColor(item.priority)}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm text-gray-900 truncate">{item.entity}</p>
                      <span className={`${badge.color} text-white text-xs font-bold px-2 py-0.5 rounded`}>
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{item.document}</p>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <p className="font-semibold text-sm text-gray-900">{item.daysRemaining}d</p>
                    </div>
                    <p className="text-xs text-gray-500">{item.expiryDate}</p>
                  </div>
                </div>
              )
            })}
            {items.length > sorted.length && (
              <p className="text-xs text-gray-500 text-center pt-2">
                +{items.length - sorted.length} vencimientos más
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
