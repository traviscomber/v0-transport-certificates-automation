"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, Clock, Info } from "lucide-react"
import { useRouter } from "next/navigation"

interface AlertItemProps {
  id: string
  type: string
  title: string
  message: string
  created_at: string
  source?: string
  metadata?: Record<string, any>
  onNavigate?: () => void
}

// Memoized alert item to prevent re-renders when parent updates
const AlertItem = React.memo<AlertItemProps>(({
  id,
  type,
  title,
  message,
  created_at,
  source,
  metadata,
  onNavigate
}) => {
  const router = useRouter()
  
  const getStatusIcon = (alertType: string) => {
    switch (alertType) {
      case "DOCUMENT_UPLOADED":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "ANOMALY_DETECTED":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "DOCUMENT_EXPIRING":
        return <Clock className="h-5 w-5 text-orange-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getStatusBadge = (alertType: string) => {
    switch (alertType) {
      case "DOCUMENT_UPLOADED":
        return <Badge className="bg-green-500/20 text-green-700">Documento</Badge>
      case "ANOMALY_DETECTED":
        return <Badge className="bg-yellow-500/20 text-yellow-700">Anomalía</Badge>
      case "DOCUMENT_EXPIRING":
        return <Badge className="bg-orange-500/20 text-orange-700">Vencimiento</Badge>
      default:
        return <Badge variant="secondary">Alerta</Badge>
    }
  }

  const handleClick = () => {
    if (onNavigate) {
      onNavigate()
    } else {
      router.push('/dashboard/company/alertas')
    }
  }

  return (
    <div 
      className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 p-4 border border-slate-700 rounded-lg hover:bg-slate-800/50 hover:border-orange-500/30 transition-all cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3 flex-1 min-w-0">
        <div className="mt-0.5 flex-shrink-0">{getStatusIcon(type)}</div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{message}</p>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-xs text-muted-foreground">
              {new Date(created_at).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            {source === 'document_upload' && metadata?.document_type && (
              <Badge variant="secondary" className="text-xs">
                {metadata.document_type}
              </Badge>
            )}
          </div>
        </div>
      </div>
      <div className="flex-shrink-0">{getStatusBadge(type)}</div>
    </div>
  )
})

AlertItem.displayName = "AlertItem"

export { AlertItem }
