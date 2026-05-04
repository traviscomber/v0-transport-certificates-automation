'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface Ejecutiva {
  name: string
  count: number
}

interface Props {
  ejecutivas: Ejecutiva[]
  selectedEjecutiva?: string
}

export default function EjecutivasFilterClient({ ejecutivas, selectedEjecutiva }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSelect = (ejecutiva: string) => {
    console.log('[v0] Filter clicked:', ejecutiva)
    const params = new URLSearchParams(searchParams)
    params.set('ejecutiva', ejecutiva)
    const newUrl = `/dashboard/company/documentos?${params.toString()}`
    console.log('[v0] Pushing to:', newUrl)
    router.push(newUrl)
  }

  const handleClear = () => {
    console.log('[v0] Clear filter clicked')
    router.push('/dashboard/company/documentos')
  }

  // Sort ejecutivas by count descending, then alphabetically
  const sortedEjecutivas = [...ejecutivas].sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count
    return a.name.localeCompare(b.name)
  })

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardContent className="pt-6">
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-200">
            Filtrar por Ejecutiva
          </label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={!selectedEjecutiva ? 'default' : 'outline'}
              onClick={handleClear}
              className="text-sm"
            >
              Todos
            </Button>
            {sortedEjecutivas.map((ejecutiva) => (
              <Button
                key={ejecutiva.name}
                variant={selectedEjecutiva === ejecutiva.name ? 'default' : 'outline'}
                onClick={() => handleSelect(ejecutiva.name)}
                className="text-sm"
              >
                {ejecutiva.name}
                <span className="ml-1 text-xs opacity-70">({ejecutiva.count})</span>
                {selectedEjecutiva === ejecutiva.name && (
                  <X className="ml-1 h-3 w-3" />
                )}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
