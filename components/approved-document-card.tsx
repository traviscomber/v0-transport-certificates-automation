'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { User, Building2, Eye, Download } from 'lucide-react'
import { getChileDate, getChileTime } from '@/lib/timezone-utils'
import { getDocTypeIcon } from '@/lib/document-type-icons'
import { buildDocumentAccessUrl } from '@/lib/document-file-access'
import { getMonthYear } from '@/lib/document-grouping'

interface ApprovedDocumentCardProps {
  doc: any
  onPreview: (doc: any) => void
  getExecutive: (doc: any) => string
}

export function ApprovedDocumentCard({ doc, onPreview, getExecutive }: ApprovedDocumentCardProps) {
  const iconConfig = getDocTypeIcon(doc.docType)
  const IconComponent = iconConfig.icon

  const getApprovalDate = (doc: any) => {
    const dateStr = doc.updated_at || doc.reviewed_at || doc.created_at
    return getChileDate(dateStr)
  }

  const getApprovalTime = (doc: any) => {
    const dateStr = doc.validated_at || doc.approved_at || doc.updated_at || doc.reviewed_at || doc.created_at
    return getChileTime(dateStr)
  }

  const getApprovalPeriod = (doc: any) => {
    const dateStr = doc.validated_at || doc.approved_at || doc.updated_at || doc.reviewed_at || doc.created_at
    return getMonthYear(dateStr, 'es')
  }

  const docTypeChipClass = `${iconConfig.bg} ${iconConfig.border} ${iconConfig.color} border shadow-sm backdrop-blur-sm`

  return (
    <Card className="bg-gradient-to-r from-slate-900/80 to-slate-800/80 border-slate-700/50 hover:border-green-500/30 transition-all hover:shadow-lg hover:shadow-green-500/10">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-6">
          {/* Left section with icon and details */}
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconConfig.bg} border ${iconConfig.border}`}>
                <IconComponent className={`h-5 w-5 ${iconConfig.color}`} strokeWidth={1.5} />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white truncate text-lg">
                {doc.original_filename || doc.document_name}
              </h3>
              
              <div className="mt-3 space-y-2">
                {doc.conductores && (
                  <div className="flex items-center gap-2 text-sm text-slate-200">
                    <User className="h-4 w-4 flex-shrink-0 text-slate-300" />
                    <span className="truncate">
                      {doc.conductores.nombres} {doc.conductores.apellido_paterno}
                    </span>
                    <span className="text-xs text-slate-300 flex-shrink-0">
                      ({doc.conductores.rut})
                    </span>
                  </div>
                )}
                
                {doc.transportistas && (
                  <div className="flex items-center gap-2 text-sm text-slate-200">
                    <Building2 className="h-4 w-4 flex-shrink-0 text-slate-300" />
                    <span className="truncate">{(Array.isArray(doc.transportistas) ? doc.transportistas[0]?.razon_social : doc.transportistas?.razon_social) || 'N/A'}</span>
                    <span className="text-xs text-slate-300 flex-shrink-0">
                      ({(Array.isArray(doc.transportistas) ? doc.transportistas[0]?.rut : doc.transportistas?.rut) || 'N/A'})
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm text-slate-200">
                  <User className="h-4 w-4 flex-shrink-0 text-slate-300" />
                  <span className="truncate text-xs">Aprobado por: {getExecutive(doc)}</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-300">
                    Periodo: {getApprovalPeriod(doc)}
                  </Badge>
                  <Badge variant="outline" className="bg-slate-500/10 border-slate-500/30 text-slate-200">
                    Fecha: {getApprovalDate(doc)} {getApprovalTime(doc)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Right section with status and buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30 whitespace-nowrap">
              ✓ Aprobado
            </Badge>
            {doc.docType && (
              <Badge
                variant="outline"
                className={`whitespace-nowrap flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${docTypeChipClass}`}
              >
                <IconComponent className="h-3 w-3 flex-shrink-0" strokeWidth={1.5} />
                {doc.docType.nombre}
              </Badge>
            )}
            {doc.file_url && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPreview(doc)}
                className="text-xs gap-1 border-blue-400/50 text-blue-300 hover:bg-blue-500/20"
                title="Ver documento"
              >
                <Eye className="h-4 w-4" />
                Ver
              </Button>
            )}
            {doc.file_url && (
              <a href={buildDocumentAccessUrl(doc.file_url, 'download')} target="_blank" rel="noopener noreferrer">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1 border-slate-400/50 text-slate-300 hover:bg-slate-500/20"
                  title="Descargar documento"
                >
                  <Download className="h-4 w-4" />
                  Descar
                </Button>
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
