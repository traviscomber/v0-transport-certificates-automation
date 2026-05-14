'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2, User } from 'lucide-react'

interface AssignExecutiveModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transportistaId: string
  transportistaNombre: string
  onAssignmentSuccess: () => void
}

export function AssignExecutiveModal({
  open,
  onOpenChange,
  transportistaId,
  transportistaNombre,
  onAssignmentSuccess,
}: AssignExecutiveModalProps) {
  const [executives, setExecutives] = useState<any[]>([])
  const [selectedExecutive, setSelectedExecutive] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState(false)

  // Fetch active executives
  useEffect(() => {
    if (open) {
      fetchExecutives()
    }
  }, [open])

  const fetchExecutives = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/admin/executive-staff?is_active=true')
      if (!response.ok) throw new Error('Failed to fetch executives')
      const data = await response.json()
      // Handle both direct array and { executives: [] } response format
      const executivesList = Array.isArray(data) ? data : data.executives || []
      setExecutives(executivesList)
      setSelectedExecutive('')
    } catch (err) {
      setError('Error loading executives')
      console.error(err)
      setExecutives([])
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async () => {
    if (!selectedExecutive) {
      setError('Please select an executive')
      return
    }

    setAssigning(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch('/api/transportistas/assign-executive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transportista_id: transportistaId,
          ejecutiva_id: selectedExecutive,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to assign executive')
      }

      setSuccess(true)
      setTimeout(() => {
        onOpenChange(false)
        onAssignmentSuccess()
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Error assigning executive')
    } finally {
      setAssigning(false)
    }
  }

  const selectedExecName = Array.isArray(executives) 
    ? executives.find((e) => e.id === selectedExecutive)?.full_name 
    : undefined

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Asignar Ejecutiva
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <p className="text-sm font-medium text-slate-300 mb-2">Empresa:</p>
            <p className="text-slate-400 text-sm">{transportistaNombre}</p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
              <p className="text-sm text-green-300">
                Ejecutiva asignada correctamente
              </p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-slate-300 mb-2">
                Selecciona una ejecutiva:
              </p>
              <div className="grid gap-2 max-h-60 overflow-y-auto">
                {executives.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">
                    No hay ejecutivas disponibles
                  </p>
                ) : (
                  executives.map((exec) => (
                    <button
                      key={exec.id}
                      onClick={() => setSelectedExecutive(exec.id)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        selectedExecutive === exec.id
                          ? 'bg-blue-500/20 border-blue-500/50 text-blue-200'
                          : 'bg-slate-700/30 border-slate-600 text-slate-300 hover:bg-slate-700/50'
                      }`}
                    >
                      <p className="font-medium">{exec.full_name}</p>
                      <p className="text-xs text-slate-400">{exec.email}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {selectedExecName && (
            <div className="p-3 rounded-lg bg-slate-700/30 border border-slate-600">
              <p className="text-xs text-slate-400">Seleccionada:</p>
              <p className="text-sm font-medium text-slate-200">
                {selectedExecName}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={assigning}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedExecutive || assigning || success}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {assigning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Asignando...
              </>
            ) : (
              'Asignar'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
