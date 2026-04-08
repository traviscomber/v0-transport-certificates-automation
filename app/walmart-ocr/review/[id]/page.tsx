'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Clock, AlertTriangle, CheckCircle, XCircle, Edit2, Save, RotateCcw, ZoomIn, ZoomOut, Flag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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

const flagLevelColors = {
  critical: 'bg-red-500/10 text-red-500 border-red-500/20',
  warning: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  info: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
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

  useEffect(() => {
    fetchReview()
  }, [resolvedParams.id])

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
    
    // Track correction
    if (newValue !== originalValue) {
      setCorrections(prev => {
        const existing = prev.find(c => c.fieldName === fieldName)
        if (existing) {
          return prev.map(c => c.fieldName === fieldName ? { ...c, correctedValue: newValue } : c)
        }
        return [...prev, { fieldName, originalValue, correctedValue: newValue, errorType: 'misread' }]
      })
    } else {
      setCorrections(prev => prev.filter(c => c.fieldName !== fieldName))
    }
  }

  function resetField(fieldName: string) {
    const originalValue = review?.document.extractedData?.[fieldName] || ''
    setEditedData(prev => ({ ...prev, [fieldName]: originalValue }))
    setCorrections(prev => prev.filter(c => c.fieldName !== fieldName))
  }

  async function submitDecision(decision: 'approved' | 'rejected' | 'needs_correction' | 'escalated') {
    if (!review) return
    
    setSubmitting(true)
    try {
      const body: any = {
        action: 'complete',
        reviewerId: 'demo-reviewer', // TODO: usar usuario autenticado
        decision,
        notes
      }
      
      if (decision === 'rejected') {
        body.rejectionReason = rejectionReason
      }
      
      if (corrections.length > 0) {
        body.originalData = review.document.extractedData
        body.correctedData = editedData
        body.corrections = corrections
      }
      
      const res = await fetch(`/api/v2/review-queue/${resolvedParams.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      
      const data = await res.json()
      if (data.success) {
        router.push('/walmart-ocr/review')
      } else {
        alert('Error: ' + data.error)
      }
    } catch (err) {
      console.error('Error submitting decision:', err)
      alert('Error al enviar decision')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!review) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Revision no encontrada</h2>
          <Link href="/walmart-ocr/review" className="text-primary hover:underline">
            Volver a la cola
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/walmart-ocr/review" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
                <span>Cola</span>
              </Link>
              <div className="h-6 w-px bg-border" />
              <div>
                <h1 className="text-lg font-semibold">{review.document.typeName}</h1>
                <p className="text-sm text-muted-foreground">{review.document.category} - {review.reviewReason}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-1 text-sm ${review.slaStatus === 'breached' ? 'text-red-500' : review.slaStatus === 'urgent' ? 'text-orange-500' : 'text-muted-foreground'}`}>
                <Clock className="h-4 w-4" />
                {review.hoursRemaining > 0 ? `${Math.round(review.hoursRemaining)}h restantes` : 'SLA vencido'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Document Image */}
          <Card className="h-fit">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Documento Original</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setImageZoom(z => Math.max(0.5, z - 0.25))}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground w-12 text-center">{Math.round(imageZoom * 100)}%</span>
                  <Button variant="outline" size="sm" onClick={() => setImageZoom(z => Math.min(2, z + 0.25))}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative bg-muted rounded-lg overflow-auto max-h-[600px]">
                {review.document.fileUrl ? (
                  <Image
                    src={review.document.fileUrl}
                    alt={review.document.filename}
                    width={600}
                    height={800}
                    className="w-full h-auto transition-transform"
                    style={{ transform: `scale(${imageZoom})`, transformOrigin: 'top left' }}
                    unoptimized
                  />
                ) : (
                  <div className="flex items-center justify-center h-96 text-muted-foreground">
                    No hay imagen disponible
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">{review.document.filename}</p>
            </CardContent>
          </Card>

          {/* Right: Extracted Data & Actions */}
          <div className="space-y-6">
            {/* Flags/Warnings */}
            {review.flags && review.flags.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Flag className="h-4 w-4" />
                    Alertas Detectadas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {review.flags.map((flag, idx) => (
                    <Alert key={idx} className={flagLevelColors[flag.level as keyof typeof flagLevelColors]}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>{flag.field ? `${flag.field}: ` : ''}</strong>
                        {flag.message}
                      </AlertDescription>
                    </Alert>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Confidence Score */}
            {review.confidenceScore !== null && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Confianza OCR</span>
                    <span className={`text-lg font-bold ${review.confidenceScore >= 0.85 ? 'text-green-500' : review.confidenceScore >= 0.7 ? 'text-yellow-500' : 'text-red-500'}`}>
                      {Math.round(review.confidenceScore * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full ${review.confidenceScore >= 0.85 ? 'bg-green-500' : review.confidenceScore >= 0.7 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${review.confidenceScore * 100}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Extracted Data Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Datos Extraidos</CardTitle>
                <CardDescription>Revisa y corrige los datos si es necesario</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(editedData).map(([key, value]) => {
                  const isModified = corrections.some(c => c.fieldName === key)
                  const hasFlag = review.flags?.some(f => f.field === key)
                  
                  return (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={key} className="flex items-center gap-2">
                          {key}
                          {hasFlag && <AlertTriangle className="h-3 w-3 text-yellow-500" />}
                          {isModified && <Edit2 className="h-3 w-3 text-blue-500" />}
                        </Label>
                        {isModified && (
                          <Button variant="ghost" size="sm" onClick={() => resetField(key)}>
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Restaurar
                          </Button>
                        )}
                      </div>
                      <Input
                        id={key}
                        value={String(value || '')}
                        onChange={(e) => handleFieldChange(key, e.target.value)}
                        className={isModified ? 'border-blue-500' : hasFlag ? 'border-yellow-500' : ''}
                      />
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Notas de Revision</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Agrega notas sobre tu revision (opcional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    onClick={() => submitDecision('approved')}
                    disabled={submitting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Aprobar
                  </Button>
                  <Button 
                    onClick={() => submitDecision('needs_correction')}
                    disabled={submitting || corrections.length === 0}
                    variant="outline"
                    className="border-blue-500 text-blue-500 hover:bg-blue-500/10"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Aprobar con Correcciones
                  </Button>
                  <Button 
                    onClick={() => {
                      const reason = prompt('Razon del rechazo:')
                      if (reason) {
                        setRejectionReason(reason)
                        submitDecision('rejected')
                      }
                    }}
                    disabled={submitting}
                    variant="outline"
                    className="border-red-500 text-red-500 hover:bg-red-500/10"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rechazar
                  </Button>
                  <Button 
                    onClick={() => submitDecision('escalated')}
                    disabled={submitting}
                    variant="outline"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Escalar
                  </Button>
                </div>
                {corrections.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-4 text-center">
                    {corrections.length} campo(s) corregido(s)
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
