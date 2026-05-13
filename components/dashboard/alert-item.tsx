"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, Clock, Info, XCircle, FileUp, Brain, FileCheck, FileX } from "lucide-react"
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
  
  // Normalize type for matching (handle both upper and lower case)
  const normalizedType = type?.toUpperCase() || ''
  
  const getStatusIcon = (alertType: string) => {
    const t = alertType?.toUpperCase() || ''
    
    if (t.includes('APPROVED') || t.includes('APROBADO')) {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    }
    if (t.includes('REJECTED') || t.includes('RECHAZADO')) {
      return <XCircle className="h-5 w-5 text-red-500" />
    }
    if (t.includes('UPLOAD') || t.includes('SUBIDO')) {
      return <FileUp className="h-5 w-5 text-blue-500" />
    }
    if (t.includes('EXPIR') || t.includes('VENC')) {
      return <Clock className="h-5 w-5 text-orange-500" />
    }
    if (t.includes('PENDING') || t.includes('PENDIENTE')) {
      return <Clock className="h-5 w-5 text-yellow-500" />
    }
    if (t.includes('ANOMAL') || t.includes('WARNING')) {
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    }
    if (t.includes('AI') || t.includes('ANALISIS') || t.includes('IA')) {
      return <Brain className="h-5 w-5 text-purple-500" />
    }
    return <Info className="h-5 w-5 text-blue-500" />
  }

  const getStatusBadge = (alertType: string) => {
    const t = alertType?.toUpperCase() || ''
    
    if (t.includes('APPROVED') || t.includes('APROBADO')) {
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Aprobado</Badge>
    }
    if (t.includes('REJECTED') || t.includes('RECHAZADO')) {
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Rechazado</Badge>
    }
    if (t.includes('UPLOAD') || t.includes('SUBIDO')) {
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Subido</Badge>
    }
    if (t.includes('EXPIR') || t.includes('VENC')) {
      return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Vencimiento</Badge>
    }
    if (t.includes('PENDING') || t.includes('PENDIENTE')) {
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pendiente</Badge>
    }
    if (t.includes('ANOMAL') || t.includes('WARNING')) {
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Anomalia</Badge>
    }
    if (t.includes('AI') || t.includes('ANALISIS') || t.includes('IA')) {
      return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">IA</Badge>
    }
    if (t.includes('INFO') || t.includes('SUCCESS')) {
      return <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">Info</Badge>
    }
    return <Badge variant="secondary" className="bg-slate-500/20 text-slate-400">Sistema</Badge>
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
