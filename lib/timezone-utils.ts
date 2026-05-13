import { format } from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * Format a date/time to Chile timezone (CLT - UTC-4)
 * Always displays in Chile local time regardless of server/browser timezone
 */
export function formatToChileTime(
  dateInput: string | Date,
  formatStr: string = "d 'de' MMMM 'de' yyyy HH:mm:ss"
): string {
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
    
    // Format using Chile timezone (America/Santiago)
    const formatter = new Intl.DateTimeFormat('es-CL', {
      timeZone: 'America/Santiago',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })

    // For simple time-only format like 'HH:mm:ss'
    if (formatStr === 'HH:mm:ss') {
      const parts = formatter.formatToParts(date)
      const hour = parts.find(p => p.type === 'hour')?.value || '00'
      const minute = parts.find(p => p.type === 'minute')?.value || '00'
      const second = parts.find(p => p.type === 'second')?.value || '00'
      return `${hour}:${minute}:${second}`
    }

    // For date-only format like "d 'de' MMMM 'de' yyyy"
    if (formatStr.includes("'de'")) {
      const parts = formatter.formatToParts(date)
      const day = parts.find(p => p.type === 'day')?.value || '01'
      const month = parts.find(p => p.type === 'month')?.value || '01'
      const year = parts.find(p => p.type === 'year')?.value || '2026'

      // Map month numbers to Spanish month names
      const monthNames: Record<string, string> = {
        '01': 'enero',
        '02': 'febrero',
        '03': 'marzo',
        '04': 'abril',
        '05': 'mayo',
        '06': 'junio',
        '07': 'julio',
        '08': 'agosto',
        '09': 'septiembre',
        '10': 'octubre',
        '11': 'noviembre',
        '12': 'diciembre',
      }

      const monthName = monthNames[month] || 'mes desconocido'
      return `${parseInt(day)} de ${monthName} de ${year}`
    }

    // For combined date-time formats
    const parts = formatter.formatToParts(date)
    const day = parts.find(p => p.type === 'day')?.value || '01'
    const month = parts.find(p => p.type === 'month')?.value || '01'
    const year = parts.find(p => p.type === 'year')?.value || '2026'
    const hour = parts.find(p => p.type === 'hour')?.value || '00'
    const minute = parts.find(p => p.type === 'minute')?.value || '00'
    const second = parts.find(p => p.type === 'second')?.value || '00'

    const monthNames: Record<string, string> = {
      '01': 'enero',
      '02': 'febrero',
      '03': 'marzo',
      '04': 'abril',
      '05': 'mayo',
      '06': 'junio',
      '07': 'julio',
      '08': 'agosto',
      '09': 'septiembre',
      '10': 'octubre',
      '11': 'noviembre',
      '12': 'diciembre',
    }

    const monthName = monthNames[month] || 'mes desconocido'
    return `${parseInt(day)} de ${monthName} de ${year} ${hour}:${minute}:${second}`
  } catch (error) {
    console.error('[v0] Error formatting Chile time:', error)
    return 'Hora desconocida'
  }
}

/**
 * Get only the time in Chile timezone (HH:mm:ss format)
 */
export function getChileTime(dateInput: string | Date): string {
  return formatToChileTime(dateInput, 'HH:mm:ss')
}

/**
 * Get only the date in Chile timezone with Spanish month names
 */
export function getChileDate(dateInput: string | Date): string {
  return formatToChileTime(dateInput, "d 'de' MMMM 'de' yyyy")
}
