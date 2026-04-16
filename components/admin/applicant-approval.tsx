'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Clock, MessageSquare } from 'lucide-react'

interface ApplicantApprovalProps {
  applicantId: string
  applicantName: string
  currentStatus: string
  userRole: string
  onApprove?: (notes: string) => Promise<void>
  onReject?: (notes: string) => Promise<void>
}

export function ApplicantApproval({
  applicantId,
  applicantName,
  currentStatus,
  userRole,
  onApprove,
  onReject,
}: ApplicantApprovalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [notes, setNotes] = useState('')
  const [action, setAction] = useState<'approve' | 'reject' | null>(null)
  const [error, setError] = useState('')

  const canApprove =
    userRole === 'admin' ||
    userRole === 'manager' ||
    userRole === 'onboarding' ||
    userRole === 'prevencion_riesgos'

  const canFinalApprove = userRole === 'admin' || userRole === 'manager' || userRole === 'prevencion_riesgos'

  const handleApprove = async () => {
    setIsLoading(true)
    setError('')
    try {
      await onApprove?.(notes)
      setAction(null)
      setNotes('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al aprobar')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    setIsLoading(true)
    setError('')
    try {
      await onReject?.(notes)
      setAction(null)
      setNotes('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al rechazar')
    } finally {
      setIsLoading(false)
    }
  }

  const getApprovalDescription = () => {
    switch (currentStatus) {
      case 'new':
        return 'Postulante nuevo. Requiere validación de datos y inicio de chequeo de antecedentes.'
      case 'background_check_pending':
        return 'Chequeo de antecedentes en proceso. Espera resultados del sistema externo.'
      case 'background_check_passed':
        return 'Chequeo de antecedentes completado exitosamente. Ahora requiere subida de documentos.'
      case 'documents_submitted':
        return 'Documentos enviados. Requiere revisión e aprobación final.'
      case 'approved':
        return 'Postulante aprobado. Listo para ser registrado como conductor.'
      default:
        return ''
    }
  }

  if (!canApprove) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <p className="text-sm text-yellow-900">
            No tienes permisos para aprobar postulantes. Contacta a un administrador.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Aprobación de {applicantName}
        </CardTitle>
        <CardDescription>{getApprovalDescription()}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {currentStatus === 'approved' ? (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Este postulante ya ha sido aprobado y está registrado como conductor operacional.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Status Workflow */}
            <div className="space-y-2">
              <div className="text-sm font-semibold">Estado Actual</div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{currentStatus}</Badge>
              </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Notas (Opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Agrega observaciones sobre la aprobación o rechazo..."
                className="w-full rounded-md border bg-background px-3 py-2 text-sm min-h-24"
                disabled={isLoading}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              {action === null ? (
                <>
                  <Button
                    onClick={() => setAction('approve')}
                    className="gap-2"
                    disabled={isLoading || !canApprove}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Aprobar
                  </Button>
                  {canFinalApprove && (
                    <Button
                      onClick={() => setAction('reject')}
                      variant="destructive"
                      className="gap-2"
                      disabled={isLoading}
                    >
                      <XCircle className="h-4 w-4" />
                      Rechazar
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button
                    onClick={action === 'approve' ? handleApprove : handleReject}
                    disabled={isLoading}
                    variant={action === 'reject' ? 'destructive' : 'default'}
                    className="gap-2"
                  >
                    {isLoading && <Clock className="h-4 w-4 animate-spin" />}
                    {action === 'approve' ? 'Confirmar Aprobación' : 'Confirmar Rechazo'}
                  </Button>
                  <Button
                    onClick={() => {
                      setAction(null)
                      setNotes('')
                    }}
                    variant="outline"
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                </>
              )}
            </div>

            {/* Permission Info */}
            <div className="text-xs text-muted-foreground pt-4 border-t">
              <p>
                <strong>Tu rol:</strong> {userRole}
              </p>
              {userRole === 'onboarding' && (
                <p className="mt-1">
                  Tienes permisos para aprobar chequeos de antecedentes y solicitudes de documentos.
                </p>
              )}
              {userRole === 'prevencion_riesgos' && (
                <p className="mt-1">
                  Tienes permisos para realizar la aprobación final del postulante.
                </p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
