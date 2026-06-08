/**
 * Utilities for grouping and organizing documents by month
 */

export interface DocumentByMonth {
  month: string // "JUNIO 2026" or "JUNE 2026"
  monthKey: string // "2026-06" for sorting
  documents: any[]
  count: number
}

/**
 * Get month and year from a date string
 */
export function getMonthYear(dateString: string | null | undefined, locale: 'es' | 'en' = 'es'): string {
  if (!dateString) return locale === 'es' ? 'Sin fecha' : 'No date'
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return locale === 'es' ? 'Fecha inválida' : 'Invalid date'
    
    const months_es = [
      'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
      'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
    ]
    const months_en = [
      'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
      'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
    ]
    
    const monthName = locale === 'es' ? months_es[date.getMonth()] : months_en[date.getMonth()]
    const year = date.getFullYear()
    
    return `${monthName} ${year}`
  } catch (e) {
    return locale === 'es' ? 'Fecha inválida' : 'Invalid date'
  }
}

/**
 * Get month key for sorting (YYYY-MM)
 */
export function getMonthKey(dateString: string | null | undefined): string {
  if (!dateString) return '0000-00'
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '0000-00'
    
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    
    return `${year}-${month}`
  } catch (e) {
    return '0000-00'
  }
}

/**
 * Group documents by month
 */
export function groupDocumentsByMonth(
  documents: any[],
  dateField: string = 'created_at',
  locale: 'es' | 'en' = 'es'
): DocumentByMonth[] {
  const grouped = new Map<string, { monthKey: string; documents: any[] }>()
  
  documents.forEach((doc) => {
    // For each document, use the best available approval date
    let dateValue = doc[dateField]
    
    // Smart fallback chain for approval documents:
    // 1. Use the specified field (validated_at or approved_at)
    // 2. If empty, try the other approval field
    // 3. Then fall back to updated_at, then created_at
    if (!dateValue) {
      if (dateField === 'validated_at') {
        dateValue = doc.approved_at || doc.updated_at || doc.created_at
      } else if (dateField === 'approved_at') {
        dateValue = doc.validated_at || doc.updated_at || doc.created_at
      } else {
        dateValue = doc.validated_at || doc.approved_at || doc.updated_at || doc.created_at
      }
    }
    
    const monthKey = getMonthKey(dateValue)
    
    if (!grouped.has(monthKey)) {
      grouped.set(monthKey, { monthKey, documents: [] })
    }
    grouped.get(monthKey)!.documents.push(doc)
  })
  
  // Sort by month (newest first)
  const sorted = Array.from(grouped.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([monthKey, { documents: docs }]) => {
      // Get the best date from first doc for display - use same fallback chain
      const firstDoc = docs[0]
      let displayDate = firstDoc[dateField]
      if (!displayDate) {
        if (dateField === 'validated_at') {
          displayDate = firstDoc.approved_at || firstDoc.updated_at || firstDoc.created_at
        } else if (dateField === 'approved_at') {
          displayDate = firstDoc.validated_at || firstDoc.updated_at || firstDoc.created_at
        } else {
          displayDate = firstDoc.validated_at || firstDoc.approved_at || firstDoc.updated_at || firstDoc.created_at
        }
      }
      
      return {
        month: getMonthYear(displayDate, locale),
        monthKey,
        documents: docs,
        count: docs.length
      }
    })
  
  return sorted
}

/**
 * Format date to readable string
 */
export function formatDate(dateString: string | null | undefined, locale: 'es' | 'en' = 'es'): string {
  if (!dateString) return locale === 'es' ? 'Sin fecha' : 'No date'
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return locale === 'es' ? 'Fecha inválida' : 'Invalid date'
    
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
    
    return date.toLocaleDateString(locale === 'es' ? 'es-CL' : 'en-US', options)
  } catch (e) {
    return locale === 'es' ? 'Fecha inválida' : 'Invalid date'
  }
}
