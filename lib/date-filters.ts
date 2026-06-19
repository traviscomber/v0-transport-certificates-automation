export interface DateFilterValue {
  month: string
  year: string
}

export const ALL_VALUE = 'all'

const MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

export function getMonthOptions() {
  return [
    { value: ALL_VALUE, label: 'Todos los meses' },
    ...MONTHS.map((label, index) => ({
      value: String(index + 1).padStart(2, '0'),
      label,
    })),
  ]
}

export function getYearOptions(yearsBack = 5, yearsForward = 1) {
  const options: Array<{ value: string; label: string }> = [{ value: ALL_VALUE, label: 'Todos los años' }]
  const now = new Date().getFullYear()

  for (let year = now + yearsForward; year >= now - yearsBack; year--) {
    options.push({ value: String(year), label: String(year) })
  }

  return options
}

export function getMonthYearRange(month: string, year: string) {
  if (month !== ALL_VALUE && month && year !== ALL_VALUE && year) {
    const start = new Date(Number(year), Number(month) - 1, 1)
    const end = new Date(Number(year), Number(month), 0, 23, 59, 59, 999)
    return { start, end }
  }

  if (year !== ALL_VALUE && year) {
    const start = new Date(Number(year), 0, 1)
    const end = new Date(Number(year), 11, 31, 23, 59, 59, 999)
    return { start, end }
  }

  if (month !== ALL_VALUE && month) {
    const start = new Date(1900, Number(month) - 1, 1)
    const end = new Date(2100, Number(month), 0, 23, 59, 59, 999)
    return { start, end }
  }

  return null
}

export function filterByMonthYear<T>(
  items: T[],
  dateAccessor: (item: T) => string | Date | null | undefined,
  month: string,
  year: string
) {
  const range = getMonthYearRange(month, year)

  if (!range) {
    return items
  }

  return items.filter((item) => {
    const value = dateAccessor(item)
    if (!value) return false
    const date = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(date.getTime())) return false
    return date >= range.start && date <= range.end
  })
}

export function isFilterActive(month: string, year: string) {
  return month !== ALL_VALUE || year !== ALL_VALUE
}

export function getMonthLabel(month: string, year?: string) {
  if ((!month || month === ALL_VALUE) && (!year || year === ALL_VALUE)) return 'Todos los meses'

  if (!month || month === ALL_VALUE) {
    return year && year !== ALL_VALUE ? `Año ${year}` : 'Todos los meses'
  }

  const monthNumber = Number(month)
  const monthName = MONTHS[monthNumber - 1] || month

  if (year && year !== ALL_VALUE) {
    return `${monthName} ${year}`
  }

  return monthName
}
