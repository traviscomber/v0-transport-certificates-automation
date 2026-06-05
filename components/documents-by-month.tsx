'use client'

import { useState, useCallback } from 'react'
import { ChevronDown, ChevronUp, Calendar, FileStack } from 'lucide-react'
import { DocumentByMonth } from '@/lib/document-grouping'

interface DocumentsByMonthProps {
  monthsData: DocumentByMonth[]
  renderDocument: (document: any) => React.ReactNode
  emptyMessage?: string
}

export function DocumentsByMonth({
  monthsData,
  renderDocument,
  emptyMessage = 'No hay documentos'
}: DocumentsByMonthProps) {
  // Track which months are expanded (default: all expanded)
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(
    new Set(monthsData.map(m => m.monthKey))
  )

  const toggleMonth = useCallback((monthKey: string) => {
    setExpandedMonths(prev => {
      const newExpanded = new Set(prev)
      if (newExpanded.has(monthKey)) {
        newExpanded.delete(monthKey)
      } else {
        newExpanded.add(monthKey)
      }
      return newExpanded
    })
  }, [])

  if (!monthsData || monthsData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="rounded-lg bg-slate-800/50 border border-slate-700/50 p-8 text-center max-w-sm">
          <FileStack className="h-12 w-12 mx-auto mb-4 text-slate-500" />
          <p className="text-slate-300 font-medium">{emptyMessage}</p>
        </div>
      </div>
    )
  }

  // Calculate total documents for statistics
  const totalDocs = monthsData.reduce((sum, m) => sum + m.count, 0)

  return (
    <div className="space-y-2">
      {/* Summary stats */}
      <div className="px-4 py-4 bg-gradient-to-r from-slate-900/80 to-slate-800/80 border border-slate-700/50 rounded-lg mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileStack className="h-5 w-5 text-blue-400" />
            <p className="text-sm text-slate-200">
              <span className="font-semibold text-white">{totalDocs}</span> documento{totalDocs !== 1 ? 's' : ''} en <span className="font-semibold text-white">{monthsData.length}</span> mes{monthsData.length !== 1 ? 'es' : ''}
            </p>
          </div>
          <div className="text-xs text-slate-400">
            {monthsData.length > 0 && (
              <span>Más reciente: {monthsData[0].month}</span>
            )}
          </div>
        </div>
      </div>

      {/* Months list */}
      <div className="border border-slate-700/50 rounded-lg overflow-hidden divide-y divide-slate-700/50">
        {monthsData.map((monthData, idx) => {
          const isExpanded = expandedMonths.has(monthData.monthKey)
          const isFirstMonth = idx === 0
          
          return (
            <div key={monthData.monthKey} className={isFirstMonth ? 'bg-gradient-to-r from-blue-500/5 to-transparent' : ''}>
              {/* Month Header */}
              <button
                onClick={() => toggleMonth(monthData.monthKey)}
                className="w-full flex items-center justify-between px-4 py-4 hover:bg-slate-800/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <Calendar className="h-4 w-4 text-slate-400 group-hover:text-slate-300 transition-colors" />
                    <span className="font-semibold text-sm text-slate-100 group-hover:text-white transition-colors">
                      {monthData.month}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white bg-blue-500/20 border border-blue-500/30 px-2 py-1 rounded-full">
                      {monthData.count}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400 group-hover:text-slate-300 transition-colors" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-slate-300 transition-colors" />
                  )}
                </div>
              </button>

              {/* Documents List - Rendered lazily only when expanded */}
              {isExpanded && (
                <div className="bg-slate-900/30 border-t border-slate-700/30 px-4 py-4 space-y-3 animate-in fade-in duration-200">
                  {monthData.documents.map((doc, docIdx) => (
                    <div 
                      key={`${doc.id || docIdx}`} 
                      className="lazy-rendered animate-in fade-in duration-300"
                      style={{ animationDelay: `${docIdx * 50}ms` }}
                    >
                      {renderDocument(doc)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
