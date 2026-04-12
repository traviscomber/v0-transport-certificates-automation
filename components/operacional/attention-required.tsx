'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, ArrowRight } from 'lucide-react'

interface AttentionItem {
  id: string
  entity: string
  reason: string
  severity: 'critical' | 'warning'
  days?: number
  action: string
}

interface AttentionRequiredProps {
  items: AttentionItem[]
}

export function AttentionRequired({ items }: AttentionRequiredProps) {
  const criticalItems = items.filter(i => i.severity === 'critical').slice(0, 8)
  const warningItems = items.filter(i => i.severity === 'warning').slice(0, 7 - criticalItems.length)
  const displayItems = [...criticalItems, ...warningItems]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            Requiere atención hoy ({items.length})
          </CardTitle>
          {items.length > 0 && (
            <span className="text-sm text-gray-500">
              {criticalItems.length} críticos, {warningItems.length} advertencias
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {displayItems.length === 0 ? (
          <p className="text-gray-500 text-sm py-4">Todo en orden - No hay items pendientes</p>
        ) : (
          <div className="space-y-2">
            {displayItems.map(item => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-lg border-l-4 ${
                  item.severity === 'critical'
                    ? 'bg-red-50 border-l-red-600'
                    : 'bg-amber-50 border-l-amber-600'
                }`}
              >
                <div className="flex-1">
                  <p className={`font-medium text-sm ${
                    item.severity === 'critical' ? 'text-red-900' : 'text-amber-900'
                  }`}>
                    {item.entity}
                  </p>
                  <p className={`text-xs ${
                    item.severity === 'critical' ? 'text-red-700' : 'text-amber-700'
                  }`}>
                    {item.reason}
                    {item.days && <span> ({item.days} días)</span>}
                  </p>
                </div>
                <button className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                  item.severity === 'critical'
                    ? 'bg-red-200 text-red-700 hover:bg-red-300'
                    : 'bg-amber-200 text-amber-700 hover:bg-amber-300'
                }`}>
                  {item.action}
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
            {items.length > displayItems.length && (
              <p className="text-xs text-gray-500 text-center pt-2">
                +{items.length - displayItems.length} items más
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
