'use client'

import { AlertTriangle, AlertCircle, CheckCircle, Info, Clock, FileText, User, Building2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface AlertItemProps {
  id: string
  type: 'warning' | 'error' | 'success' | 'info'
  title: string
  description: string
  timestamp: Date
  entityType?: 'driver' | 'subcontractor' | 'document' | 'system'
  entityId?: string
  entityName?: string
  actionUrl?: string
  actionLabel?: string
  read?: boolean
}

const typeStyles = {
  warning: { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50 border-orange-200', badge: 'bg-orange-100 text-orange-800' },
  error: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 border-red-200', badge: 'bg-red-100 text-red-800' },
  success: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50 border-green-200', badge: 'bg-green-100 text-green-800' },
  info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50 border-blue-200', badge: 'bg-blue-100 text-blue-800' },
}

const entityIcons = {
  driver: { icon: User, label: 'Conductor' },
  subcontractor: { icon: Building2, label: 'Subcontratista' },
  document: { icon: FileText, label: 'Documento' },
  system: { icon: Info, label: 'Sistema' },
}

export function AlertItem({
  id,
  type,
  title,
  description,
  timestamp,
  entityType = 'system',
  entityName,
  actionUrl,
  actionLabel,
  read = false,
}: AlertItemProps) {
  const typeStyle = typeStyles[type]
  const IconComponent = typeStyle.icon
  const entityIcon = entityIcons[entityType]
  const EntityIconComponent = entityIcon.icon

  return (
    <Card className={`${typeStyle.bg} border ${read ? 'opacity-60' : ''}`}>
      <div className="p-4">
        <div className="flex gap-4">
          <div className="flex-shrink-0 mt-1">
            <IconComponent className={`w-5 h-5 ${typeStyle.color}`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-semibold text-sm">{title}</h3>
              <Badge className={typeStyle.badge} variant="secondary">{type === 'warning' ? 'Alerta' : type === 'error' ? 'Error' : type === 'success' ? 'Éxito' : 'Información'}</Badge>
            </div>
            
            <p className="text-sm text-muted-foreground mb-2">{description}</p>
            
            {entityName && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                <EntityIconComponent className="w-3 h-3" />
                <span>{entityIcon.label}: <strong>{entityName}</strong></span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: es })}
              </span>
              
              {actionUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => window.location.href = actionUrl}
                >
                  {actionLabel || 'Ver'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
