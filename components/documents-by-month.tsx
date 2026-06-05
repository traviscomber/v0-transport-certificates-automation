'use client'

import { useState, useCallback } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
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
      <div className="flex items-center justify-center py-8 px-4 text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  // Calculate total documents for statistics
  const totalDocs = monthsData.reduce((sum, m) => sum + m.count, 0)

  return (
    <div className="space-y-1">
      {/* Summary stats */}
      <div className="px-4 py-3 bg-muted/50 rounded-lg mb-4">
        <p className="text-sm text-muted-foreground">
          Total: <span className="font-semibold text-foreground">{totalDocs}</span> documento{totalDocs !== 1 ? 's' : ''}
        </p>
      </div>

      {monthsData.map((monthData) => {
        const isExpanded = expandedMonths.has(monthData.monthKey)
        
        return (
          <div key={monthData.monthKey} className="border-b">
            {/* Month Header */}
            <button
              onClick={() => toggleMonth(monthData.monthKey)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{monthData.month}</span>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                  {monthData.count} documento{monthData.count !== 1 ? 's' : ''}
                </span>
              </div>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>

            {/* Documents List - Rendered lazily only when expanded */}
            {isExpanded && (
              <div className="bg-muted/30 px-4 py-3 space-y-3">
                {monthData.documents.map((doc, idx) => (
                  <div key={`${doc.id || idx}`} className="lazy-rendered">
                    {renderDocument(doc)}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
