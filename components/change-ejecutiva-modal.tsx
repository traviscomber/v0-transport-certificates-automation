'use client'

import { useState } from 'react'
import { X, Loader } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const EJECUTIVAS = [
  { email: 'dsilva@labbe.cl', nombre: 'Daniela Constanza Silva Rojas' },
  { email: 'ocarrasco@labbe.cl', nombre: 'Olga Carrasco' },
  { email: 'csepulveda@labbe.cl', nombre: 'Carolina Sepúlveda' },
  { email: 'jayala@labbe.cl', nombre: 'Javiera Ayala Rodriguez' },
]

interface ChangeEjecutivaModalProps {
  subcontractor: any
  currentEjecutiva: string | null
  onClose: () => void
  onSuccess: (newEjecutiva: string) => void
}

export function ChangeEjecutivaModal({
  subcontractor,
  currentEjecutiva,
  onClose,
  onSuccess,
}: ChangeEjecutivaModalProps) {
  const [selectedEjecutiva, setSelectedEjecutiva] = useState<string>(currentEjecutiva || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!selectedEjecutiva) {
      setError('Por favor selecciona una ejecutiva')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/transportistas/assign-ejecutiva-simple', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rut: subcontractor.rut,
          ejecutiva_email: selectedEjecutiva,
        }),
      })

      if (!response.ok) {
        throw new Error('Error al cambiar ejecutiva')
      }

      const data = await response.json()
      const nuevaNombre = EJECUTIVAS.find((e) => e.email === selectedEjecutiva)?.nombre
      onSuccess(nuevaNombre || selectedEjecutiva)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/70" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-900 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-700">
            <CardTitle className="text-lg text-white">Cambiar Ejecutiva</CardTitle>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </CardHeader>

          <CardContent className="space-y-4 p-6">
            <div>
              <p className="text-sm text-slate-400 mb-2">Empresa: {subcontractor.nombre}</p>
              <p className="text-sm text-slate-400 mb-4">RUT: {subcontractor.rut}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-white block">
                Selecciona nueva ejecutiva:
              </label>
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                {EJECUTIVAS.map((exec) => (
                  <button
                    key={exec.email}
                    onClick={() => {
                      setSelectedEjecutiva(exec.email)
                      setError('')
                    }}
                    className={`p-3 rounded border-2 transition-all text-left ${
                      selectedEjecutiva === exec.email
                        ? 'bg-orange-500/20 border-orange-500 text-white'
                        : 'bg-slate-800/50 border-slate-600 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div className="font-medium">{exec.nombre}</div>
                    <div className="text-xs text-slate-400">{exec.email}</div>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 rounded bg-red-900/20 border border-red-800 text-red-300 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t border-slate-700">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1 bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading || !selectedEjecutiva}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Cambiar Ejecutiva'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
