'use client'

import { useState, useMemo, useCallback } from 'react'
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

// Sentinel values — Radix UI SelectItem throws when value is empty string
const ALL_EXEC = '__all_exec__'
const ALL_TYPE = '__all_type__'

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
}

interface ApprovedDocumentsFiltersProps {
  allDocs: ApprovedDocument[]
  // null means "clear filters, show everything"
  onFiltersChange: (filteredDocs: ApprovedDocument[] | null) => void
}

export function ApprovedDocumentsFilters({ allDocs, onFiltersChange }: ApprovedDocumentsFiltersProps) {
  const [searchText, setSearchText] = useState('')
  const [selectedExecutive, setSelectedExecutive] = useState(ALL_EXEC)
  const [selectedDocType, setSelectedDocType] = useState(ALL_TYPE)
  const [selectedPeriod, setSelectedPeriod] = useState('all')
  const [showFilters, setShowFilters] = useState(true)

  const executives = useMemo(() => {
    const seen = new Set<string>()
    allDocs.forEach(doc => {
      const exec = doc.approved_by_email?.split('@')[0] || doc.reviewed_by_ejecutiva || doc.ejecutiva
      if (exec) seen.add(exec)
    })
    return Array.from(seen).sort()
  }, [allDocs])

  const docTypes = useMemo(() => {
    const seen = new Set<string>()
    allDocs.forEach(doc => { if (doc.docType?.nombre) seen.add(doc.docType.nombre) })
    return Array.from(seen).sort()
  }, [allDocs])

  const hasActiveFilters =
    searchText.trim() !== '' ||
    selectedExecutive !== ALL_EXEC ||
    selectedDocType !== ALL_TYPE ||
    selectedPeriod !== 'all'

  // Pure filter function — no side effects, called directly from handlers
  const compute = useCallback((
    search: string,
    exec: string,
    type: string,
    period: string,
  ): ApprovedDocument[] | null => {
    const noFilters =
      search.trim() === '' &&
      exec === ALL_EXEC &&
      type === ALL_TYPE &&
      period === 'all'

    if (noFilters) return null

    let result = allDocs

    if (search.trim()) {
      const s = search.toLowerCase()
      result = result.filter(d =>
        (d.original_filename || d.document_name || d.file_name || '').toLowerCase().includes(s)
      )
    }

    if (exec !== ALL_EXEC) {
      result = result.filter(d => {
        const e = d.approved_by_email?.split('@')[0] || d.reviewed_by_ejecutiva || d.ejecutiva
        return e === exec
      })
    }

    if (type !== ALL_TYPE) {
      result = result.filter(d => d.docType?.nombre === type)
    }

    if (period !== 'all') {
      const now = Date.now()
      const minTs: Record<string, number> = {
        today: new Date().setHours(0, 0, 0, 0),
        week:    now - 7  * 86400000,
        month:   now - 30 * 86400000,
        quarter: now - 90 * 86400000,
      }
      const min = minTs[period] ?? 0
      result = result.filter(d => new Date(d.updated_at || d.created_at).getTime() >= min)
    }

    return result
  }, [allDocs])

  // Handlers call compute() then onFiltersChange() directly — no reactive loops
  const handleSearch = (val: string) => {
    setSearchText(val)
    onFiltersChange(compute(val, selectedExecutive, selectedDocType, selectedPeriod))
  }
  const handleExec = (val: string) => {
    setSelectedExecutive(val)
    onFiltersChange(compute(searchText, val, selectedDocType, selectedPeriod))
  }
  const handleType = (val: string) => {
    setSelectedDocType(val)
    onFiltersChange(compute(searchText, selectedExecutive, val, selectedPeriod))
  }
  const handlePeriod = (val: string) => {
    setSelectedPeriod(val)
    onFiltersChange(compute(searchText, selectedExecutive, selectedDocType, val))
  }
  const handleClear = () => {
    setSearchText('')
    setSelectedExecutive(ALL_EXEC)
    setSelectedDocType(ALL_TYPE)
    setSelectedPeriod('all')
    onFiltersChange(null)
  }

  return (
    <div className="space-y-3 mb-4">
      <div className="flex items-center justify-between">
        <Button
          onClick={() => setShowFilters(p => !p)}
          variant="outline"
          size="sm"
          className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-800/50"
        >
          <Filter className="w-4 h-4" />
          {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
        </Button>
        {hasActiveFilters && (
          <Badge variant="secondary" className="bg-orange-500/20 text-orange-300">
            Filtros activos
          </Badge>
        )}
      </div>

      {showFilters && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-2">
              Buscar por nombre de documento
            </label>
            <Input
              placeholder="Ej: certificado, licencia..."
              value={searchText}
              onChange={e => handleSearch(e.target.value)}
              className="bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-2">Periodo</label>
              <Select value={selectedPeriod} onValueChange={handlePeriod}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="week">Ultima semana</SelectItem>
                  <SelectItem value="month">Ultimo mes</SelectItem>
                  <SelectItem value="quarter">Ultimo trimestre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 block mb-2">Ejecutiva</label>
              <Select value={selectedExecutive} onValueChange={handleExec}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value={ALL_EXEC}>Todas las ejecutivas</SelectItem>
                  {executives.map(e => (
                    <SelectItem key={e} value={e}>{e}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 block mb-2">Tipo de documento</label>
              <Select value={selectedDocType} onValueChange={handleType}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value={ALL_TYPE}>Todos los tipos</SelectItem>
                  {docTypes.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {hasActiveFilters && (
            <Button
              onClick={handleClear}
              variant="ghost"
              size="sm"
              className="gap-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 w-full"
            >
              <X className="w-4 h-4" />
              Limpiar filtros
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
