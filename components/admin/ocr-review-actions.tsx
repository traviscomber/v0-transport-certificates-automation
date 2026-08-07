'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function OcrReviewActions({
  documentId,
  currentText,
}: {
  documentId: string
  currentText: string | null
}) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  const [showCorrection, setShowCorrection] = useState(false)
  const [correctedText, setCorrectedText] = useState(currentText ?? '')
  const [message, setMessage] = useState<string | null>(null)

  async function submit(action: 'approve' | 'correct' | 'retry' | 'reject') {
    setBusy(action)
    setMessage(null)
    try {
      const response = await fetch('/api/admin/ocr-review', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          documentId,
          action,
          correctedText: action === 'correct' ? correctedText : undefined,
        }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'No fue posible guardar la revisión')
      setMessage('Revisión guardada')
      setShowCorrection(false)
      router.refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Error de revisión')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" disabled={!!busy || !currentText} onClick={() => submit('approve')}>
          {busy === 'approve' ? 'Guardando…' : 'Aprobar OCR'}
        </Button>
        <Button size="sm" variant="outline" disabled={!!busy} onClick={() => setShowCorrection((value) => !value)}>
          Corregir texto
        </Button>
        <Button size="sm" variant="outline" disabled={!!busy} onClick={() => submit('retry')}>
          {busy === 'retry' ? 'Encolando…' : 'Reintentar'}
        </Button>
        <Button size="sm" variant="destructive" disabled={!!busy} onClick={() => submit('reject')}>
          {busy === 'reject' ? 'Guardando…' : 'Rechazar OCR'}
        </Button>
      </div>

      {showCorrection && (
        <div className="space-y-2">
          <textarea
            className="min-h-36 w-full rounded-md border border-slate-700 bg-slate-950 p-3 text-sm text-slate-100"
            value={correctedText}
            onChange={(event) => setCorrectedText(event.target.value)}
            placeholder="Texto corregido según evidencia visible"
          />
          <Button size="sm" disabled={!!busy || !correctedText.trim()} onClick={() => submit('correct')}>
            {busy === 'correct' ? 'Guardando…' : 'Guardar corrección auditada'}
          </Button>
        </div>
      )}

      {message && <p className="text-xs text-muted-foreground">{message}</p>}
    </div>
  )
}
