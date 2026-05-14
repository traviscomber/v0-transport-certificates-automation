import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const CHILE_TIMEZONE = 'America/Santiago'
const CHILE_OFFSET_MS = 3 * 60 * 60 * 1000 // UTC-3 (simplification, ignores DST)

/**
 * Format a date/time to Chile timezone (CLT - UTC-3/UTC-4)
 * Always displays in Chile local time regardless of server/browser timezone
 */
export function formatToChileTime(
  dateInput: string | Date,
  formatStr: string = "d 'de' MMMM 'de' yyyy HH:mm:ss"
): string {
  try {
    // Parse the input date
    let date: Date
    if (typeof dateInput === 'string') {
      date = new Date(dateInput)
    } else {
      date = dateInput
    }

    // Verify we have a valid date
    if (isNaN(date.getTime())) {
      return 'Fecha inválida'
    }
    
    // Get the current browser's timezone offset
    const browserOffsetMs = new Date().getTimezoneOffset() * 60 * 1000
    
    // Calculate the correct Chile time
    // If browser is in UTC, subtract 3 hours to get Chile time
    // If browser is elsewhere, adjust accordingly
    const chileDate = new Date(date.getTime() - browserOffsetMs - CHILE_OFFSET_MS)
    
    // For simple time-only format like 'HH:mm:ss'
    if (formatStr === 'HH:mm:ss') {
      const hours = String(chileDate.getUTCHours()).padStart(2, '0')
      const minutes = String(chileDate.getUTCMinutes()).padStart(2, '0')
      const seconds = String(chileDate.getUTCSeconds()).padStart(2, '0')
      return `${hours}:${minutes}:${seconds}`
    }

    // For date-only format like "d 'de' MMMM 'de' yyyy"
    if (formatStr.includes("'de'")) {
      const day = String(chileDate.getUTCDate()).padStart(2, '0')
      const month = String(chileDate.getUTCMonth() + 1).padStart(2, '0')
      const year = chileDate.getUTCFullYear()
      
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

    // For combined date-time formats or custom formats
    const day = String(chileDate.getUTCDate()).padStart(2, '0')
    const month = String(chileDate.getUTCMonth() + 1).padStart(2, '0')
    const year = chileDate.getUTCFullYear()
    const hours = String(chileDate.getUTCHours()).padStart(2, '0')
    const minutes = String(chileDate.getUTCMinutes()).padStart(2, '0')
    const seconds = String(chileDate.getUTCSeconds()).padStart(2, '0')

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
    return `${parseInt(day)} de ${monthName} de ${year} ${hours}:${minutes}:${seconds}`
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
