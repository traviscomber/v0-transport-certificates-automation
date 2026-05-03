'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Clock, AlertTriangle, CheckCircle, XCircle, Edit2, Save, RotateCcw, ZoomIn, ZoomOut, Flag, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ReviewDetail {
  id: string
  documentId: string
  priority: string
  status: string
  reviewReason: string
  confidenceScore: number | null
  flags: Array<{ code: string; level: string; message: string; field?: string }>
  slaDeadline: string
  slaStatus: string
  hoursRemaining: number
  document: {
    typeCode: string
    typeName: string
    category: string
    extractedData: Record<string, any>
    filename: string
    fileUrl: string
  }
}

const flagClasses: Record<string, string> = {
  critical: 'bg-red-500/10 text-red-400 border border-red-500/20',
  warning:  'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  info:     'bg-blue-500/10 text-blue-400 border border-blue-500/20',
}

export default function ReviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [review, setReview] = useState<ReviewDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editedData, setEditedData] = useState<Record<string, any>>({})
  const [corrections, setCorrections] = useState<Array<{ fieldName: string; originalValue: string; correctedValue: string; errorType: string }>>([])
  const [notes, setNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [imageZoom, setImageZoom] = useState(1)

  useEffect(() => { fetchReview() }, [resolvedParams.id])

  async function fetchReview() {
    try {
      const res = await fetch(`/api/v2/review-queue/${resolvedParams.id}`)
      const data = await res.json()
      if (data.success) {
        setReview(data.review)
        setEditedData(data.review.document.extractedData || {})
      }
    } catch (err) {
      console.error('Error fetching review:', err)
    } finally {
      setLoading(false)
    }
  }

  function handleFieldChange(fieldName: string, newValue: string) {
    const originalValue = review?.document.extractedData?.[fieldName] || ''
    setEditedData(prev => ({ ...prev, [fieldName]: newValue }))
    if (newValue !== originalValue) {
      setCorrections(prev => {
        const existing = prev.find(c => c.fieldName === fieldName)
        if (existing) return prev.map(c => c.fieldName === fieldName ? { ...c, correctedValue: newValue } : c)
        return [...prev, { fieldName, originalValue, correctedValue: newValue, errorType: 'misread' }]
      })
    } else {
      setCorrections(prev => prev.filter(c => c.fieldName !== fieldName))
    }
  }

  function resetField(fieldName: string) {
    setEditedData(prev => ({ ...prev, [fieldName]: review?.document.extractedData?.[fieldName] || '' }))
    setCorrections(prev => prev.filter(c => c.fieldName !== fieldName))
  }

  async function submitDecision(decision: 'approved' | 'rejected' | 'needs_correction' | 'escalated') {
    if (!review) return
    setSubmitting(true)
    try {
      const body: any = { action: 'complete', reviewerId: 'demo-reviewer', decision, notes }
      if (decision === 'rejected') body.rejectionReason = rejectionReason
      if (corrections.length > 0) {
        body.originalData = review.document.extractedData
        body.correctedData = editedData
        body.corrections = corrections
      }
      const res = await fetch(`/api/v2/review-queue/${resolvedParams.id}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
      })
      const data = await res.json()
      if (data.success) router.push('/ocr/review')
      else alert('Error: ' + data.error)
    } catch { alert('Error al enviar decisión') }
    finally { setSubmitting(false) }
  }

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">Cargando revisión...</p>
      </div>
    </div>
  )

  if (!review) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-bold">Revisión no encontrada</h2>
        <Link href="/ocr/review">
          <Button className="btn-orange"><ArrowLeft className="w-4 h-4 mr-2" />Volver a la cola</Button>
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Sub-header */}
      <header className="border-b border-border/50 bg-card/60 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/ocr/review" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
                <ArrowLeft className="h-4 w-4" />
                Cola de revisión
              </Link>
              <div className="h-4 w-px bg-border" />
              <div>
                <h1 className="text-sm font-semibold text-foreground">{review.document.typeName}</h1>
                <p className="text-xs text-muted-foreground">{review.document.category} — {review.reviewReason}</p>
              </div>
            </div>
            <div className={`flex items-center gap-1.5 text-xs ${
              review.slaStatus === 'breached' ? 'text-red-400' :
              review.slaStatus === 'urgent'   ? 'text-orange-400' : 'text-muted-foreground'
            }`}>
              <Clock className="h-3.5 w-3.5" />
              {review.hoursRemaining > 0 ? `${Math.round(review.hoursRemaining)}h restantes` : 'SLA vencido'}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Document image */}
          <Card className="h-fit">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Documento Original</CardTitle>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => setImageZoom(z => Math.max(0.5, z - 0.25))}>
                    <ZoomOut className="h-3.5 w-3.5" />
                  </Button>
                  <span className="text-xs text-muted-foreground w-10 text-center">{Math.round(imageZoom * 100)}%</span>
                  <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => setImageZoom(z => Math.min(2, z + 0.25))}>
                    <ZoomIn className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-secondary/40 rounded-xl overflow-auto max-h-[600px] border border-border">
                {review.document.fileUrl ? (
                  <Image
                    src={review.document.fileUrl}
                    alt={review.document.filename}
                    width={600} height={800}
                    className="w-full h-auto transition-transform"
                    style={{ transform: `scale(${imageZoom})`, transformOrigin: 'top left' }}
                    unoptimized
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
                    No hay imagen disponible
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">{review.document.filename}</p>
            </CardContent>
          </Card>

          {/* Right panel */}
          <div className="space-y-4">
            {/* Flags */}
            {review.flags?.length > 0 && (
              <Card className="border-yellow-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Flag className="h-4 w-4 text-yellow-400" />
                    Alertas Detectadas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {review.flags.map((flag, idx) => (
                    <Alert key={idx} className={flagClasses[flag.level] || flagClasses.info}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        {flag.field && <strong>{flag.field}: </strong>}
                        {flag.message}
                      </AlertDescription>
                    </Alert>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Confidence */}
            {review.confidenceScore !== null && (
              <Card>
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Confianza OCR</span>
                    <span className={`text-lg font-black ${
                      review.confidenceScore >= 0.85 ? 'text-green-400' :
                      review.confidenceScore >= 0.7  ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {Math.round(review.confidenceScore * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        review.confidenceScore >= 0.85 ? 'bg-green-500' :
                        review.confidenceScore >= 0.7  ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${review.confidenceScore * 100}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Extracted data */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Datos Extraídos</CardTitle>
                <CardDescription className="text-xs">Revisa y corrige los campos si es necesario</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(editedData).map(([key, value]) => {
                  const isModified = corrections.some(c => c.fieldName === key)
                  const hasFlag = review.flags?.some(f => f.field === key)
                  return (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={key} className="flex items-center gap-1.5 text-xs">
                          <span className="capitalize text-muted-foreground">{key.replace(/_/g, ' ')}</span>
                          {hasFlag && <AlertTriangle className="h-3 w-3 text-yellow-400" />}
                          {isModified && <Edit2 className="h-3 w-3 text-primary" />}
                        </Label>
                        {isModified && (
                          <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground hover:text-foreground px-2" onClick={() => resetField(key)}>
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Restaurar
                          </Button>
                        )}
                      </div>
                      <Input
                        id={key}
                        value={String(value || '')}
                        onChange={(e) => handleFieldChange(key, e.target.value)}
                        className={`h-8 text-sm ${isModified ? 'border-primary/60' : hasFlag ? 'border-yellow-500/60' : 'border-border'}`}
                      />
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Notas de Revisión</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Agrega notas sobre tu revisión (opcional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="text-sm bg-secondary/30 border-border focus:border-primary/50"
                />
              </CardContent>
            </Card>

            {/* Decision buttons */}
            <Card className="border-primary/30">
              <CardContent className="pt-5">
                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={() => submitDecision('approved')} disabled={submitting} className="bg-green-600 hover:bg-green-700 text-white col-span-2">
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                    Aprobar Documento
                  </Button>
                  <Button onClick={() => submitDecision('needs_correction')} disabled={submitting || corrections.length === 0} variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                    <Edit2 className="h-4 w-4 mr-2" />
                    Con Correcciones
                  </Button>
                  <Button onClick={() => {
                    const reason = prompt('Razón del rechazo:')
                    if (reason) { setRejectionReason(reason); submitDecision('rejected') }
                  }} disabled={submitting} variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                    <XCircle className="h-4 w-4 mr-2" />
                    Rechazar
                  </Button>
                  <Button onClick={() => submitDecision('escalated')} disabled={submitting} variant="outline" className="col-span-2 text-muted-foreground hover:text-foreground">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Escalar a supervisor
                  </Button>
                </div>
                {corrections.length > 0 && (
                  <p className="text-xs text-primary/80 mt-3 text-center">{corrections.length} campo(s) corregido(s)</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
