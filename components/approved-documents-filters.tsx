'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X, Filter } from 'lucide-react'

interface ApprovedDocument {
  id: string
  original_filename?: string
  document_name?: string
  file_name?: string
  ejecutiva?: string
  reviewed_by_ejecutiva?: string
  approved_by_email?: string
  docType?: { code: string; nombre: string }
  created_at: string
  updated_at?: string
  document_source?: string
}

interface ApprovedDocumentsFiltersProps {
  docs: ApprovedDocument[]
  onFiltersChange: (filteredDocs: ApprovedDocument[]) => void
}

export function ApprovedDocumentsFilters({ docs, onFiltersChange }: ApprovedDocumentsFiltersProps) {
  const [searchText, setSearchText] = useState('')
  const [selectedExecutive, setSelectedExecutive] = useState<string>('__all_exec__')
  const [selectedDocType, setSelectedDocType] = useState<string>('__all_type__')
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(true)

  // Get unique executives
  const executives = useMemo(() => {
    const execs = new Set<string>()
    docs.forEach(doc => {
      const exec = doc.approved_by_email?.split('@')[0] || doc.reviewed_by_ejecutiva || doc.ejecutiva
      if (exec && exec !== 'No especificado') {
        execs.add(exec)
      }
    })
    return Array.from(execs).sort()
  }, [docs])

  // Get unique document types
  const docTypes = useMemo(() => {
    const types = new Set<string>()
    docs.forEach(doc => {
      if (doc.docType?.nombre) {
        types.add(doc.docType.nombre)
      }
    })
    return Array.from(types).sort()
  }, [docs])

  // Apply all filters
  const filteredDocs = useMemo(() => {
    let result = docs

    // Search filter
    if (searchText.trim()) {
      const search = searchText.toLowerCase()
      result = result.filter(doc => {
        const filename = (doc.original_filename || doc.document_name || doc.file_name || '').toLowerCase()
        return filename.includes(search)
      })
    }

    // Executive filter
    if (selectedExecutive !== '__all_exec__') {
      result = result.filter(doc => {
        const exec = doc.approved_by_email?.split('@')[0] || doc.reviewed_by_ejecutiva || doc.ejecutiva
        return exec === selectedExecutive
      })
    }

    // Document type filter
    if (selectedDocType !== '__all_type__') {
      result = result.filter(doc => doc.docType?.nombre === selectedDocType)
    }

    // Period filter
    if (selectedPeriod !== 'all') {
      const now = new Date()
      let minDate: Date | null = null
      
      if (selectedPeriod === 'today') {
        minDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      } else if (selectedPeriod === 'week') {
        minDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      } else if (selectedPeriod === 'month') {
        minDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      } else if (selectedPeriod === 'quarter') {
        minDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      }

      if (minDate) {
        result = result.filter(doc => {
          const docDate = new Date(doc.updated_at || doc.created_at)
          return docDate >= minDate!
        })
      }
    }

    onFiltersChange(result)
    return result
  }, [docs, searchText, selectedExecutive, selectedDocType, selectedPeriod, onFiltersChange])

  const hasActiveFilters = searchText.trim() !== '' || selectedExecutive !== '__all_exec__' || selectedDocType !== '__all_type__' || selectedPeriod !== 'all'

  const handleClearFilters = () => {
    setSearchText('')
    setSelectedExecutive('__all_exec__')
    setSelectedDocType('__all_type__')
    setSelectedPeriod('all')
  }

  return (
    <div className="space-y-3 mb-4">
      {/* Toggle Filters Button */}
      <div className="flex items-center justify-between">
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant="outline"
          size="sm"
          className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-800/50"
        >
          <Filter className="w-4 h-4" />
          {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
        </Button>
        {hasActiveFilters && (
          <Badge variant="secondary" className="bg-orange-500/20 text-orange-300">
            {filteredDocs.length} / {docs.length} documentos
          </Badge>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-3">
          {/* Search */}
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-2">
              Buscar por nombre de documento
            </label>
            <Input
              placeholder="Ej: certificado, licencia..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500"
            />
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Period Filter */}
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-2">
                Período
              </label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="all">Todos (Sin filtro)</SelectItem>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="week">Última semana</SelectItem>
                  <SelectItem value="month">Último mes</SelectItem>
                  <SelectItem value="quarter">Último trimestre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Executive Filter */}
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-2">
                Ejecutiva
              </label>
              <Select value={selectedExecutive} onValueChange={setSelectedExecutive}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-100">
                  <SelectValue placeholder="Todas las ejecutivas" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="__all_exec__">Todas las ejecutivas</SelectItem>
                  {executives.map(exec => (
                    <SelectItem key={exec} value={exec}>
                      {exec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Document Type Filter */}
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-2">
                Tipo de documento
              </label>
              <Select value={selectedDocType} onValueChange={setSelectedDocType}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-100">
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="__all_type__">Todos los tipos</SelectItem>
                  {docTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              onClick={handleClearFilters}
              variant="ghost"
              size="sm"
              className="gap-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 w-full"
            >
              <X className="w-4 h-4" />
              Limpiar todos los filtros
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
