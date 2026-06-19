'use client'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getMonthOptions, getYearOptions, ALL_VALUE, type DateFilterValue } from '@/lib/date-filters'
import { Filter } from 'lucide-react'

interface DatePeriodFilterProps {
  value: DateFilterValue
  onChange: (value: DateFilterValue) => void
  onClear?: () => void
  className?: string
}

export function DatePeriodFilter({ value, onChange, onClear, className }: DatePeriodFilterProps) {
  const hasFilters = value.month !== ALL_VALUE || value.year !== ALL_VALUE

  return (
    <div className={`flex flex-col gap-3 rounded-lg border border-slate-700 bg-slate-900/50 p-4 ${className || ''}`}>
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-slate-400" />
        <span className="text-sm font-medium text-slate-200">Filtro temporal</span>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-400">
            Mes
          </label>
          <Select value={value.month} onValueChange={(month) => onChange({ ...value, month })}>
            <SelectTrigger className="border-slate-700 bg-slate-950 text-slate-100">
              <SelectValue placeholder="Todos los meses" />
            </SelectTrigger>
            <SelectContent className="border-slate-700 bg-slate-950">
              {getMonthOptions().map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-400">
            Año
          </label>
          <Select value={value.year} onValueChange={(year) => onChange({ ...value, year })}>
            <SelectTrigger className="border-slate-700 bg-slate-950 text-slate-100">
              <SelectValue placeholder="Todos los años" />
            </SelectTrigger>
            <SelectContent className="border-slate-700 bg-slate-950">
              {getYearOptions().map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button
            type="button"
            variant="outline"
            className="w-full border-slate-700 text-slate-200 hover:bg-slate-800"
            onClick={() => {
              const reset = { month: ALL_VALUE, year: ALL_VALUE }
              if (onClear) {
                onClear()
              } else {
                onChange(reset)
              }
            }}
            disabled={!hasFilters}
          >
            Limpiar
          </Button>
        </div>
      </div>
    </div>
  )
}
