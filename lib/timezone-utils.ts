import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { utcToZonedTime } from 'date-fns-tz'

const CHILE_TIMEZONE = 'America/Santiago'

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
    
    // Convert UTC time to Chile timezone
    const chileDate = utcToZonedTime(date, CHILE_TIMEZONE)
    
    // For simple time-only format like 'HH:mm:ss'
    if (formatStr === 'HH:mm:ss') {
      return format(chileDate, 'HH:mm:ss', { locale: es })
    }

    // For date-only format like "d 'de' MMMM 'de' yyyy"
    if (formatStr.includes("'de'")) {
      return format(chileDate, "d 'de' MMMM 'de' yyyy", { locale: es })
    }

    // For combined date-time formats or custom formats
    return format(chileDate, formatStr || "d 'de' MMMM 'de' yyyy HH:mm:ss", { locale: es })
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
