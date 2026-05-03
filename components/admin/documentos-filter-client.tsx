'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface Ejecutiva {
  id: string
  nombres: string
  apellido_paterno: string
  rut: string
}

interface Props {
  ejecutivas: Ejecutiva[]
  selectedId?: string
}

export default function DocumentosFilterClient({ ejecutivas, selectedId }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSelect = (conductorId: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('conductor_id', conductorId)
    router.push(`/admin/documentos?${params.toString()}`)
  }

  const handleClear = () => {
    router.push('/admin/documentos')
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-muted-foreground">
            Filtrar por Ejecutiva
          </label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={!selectedId ? 'default' : 'outline'}
              onClick={handleClear}
              className="text-sm"
            >
              Todos
            </Button>
            {ejecutivas.map((ejecutiva) => (
              <Button
                key={ejecutiva.id}
                variant={selectedId === ejecutiva.id ? 'default' : 'outline'}
                onClick={() => handleSelect(ejecutiva.id)}
                className="text-sm"
              >
                {ejecutiva.nombres} {ejecutiva.apellido_paterno}
                {selectedId === ejecutiva.id && (
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
