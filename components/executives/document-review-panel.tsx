"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Eye,
  Loader,
  ArrowLeft,
} from "lucide-react"

interface DocumentReviewPanelProps {
  documentId: string
  onClose: () => void
  onRefresh: () => void
}

interface DocumentData {
  id: string
  file_name: string
  file_size: string
  document_type: string
  validation_status: string
  expiry_date?: string
  ocrData?: any
  formData?: any
  profiles: {
    full_name: string
    email: string
  }
}

export function DocumentReviewPanel({
  documentId,
  onClose,
  onRefresh,
}: DocumentReviewPanelProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [document, setDocument] = useState<DocumentData | null>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reviewStatus, setReviewStatus] = useState<"approved" | "rejected" | "in_progress">(
    "in_progress"
  )
  const [comments, setComments] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    fetchDocumentData()
  }, [documentId])

  const fetchDocumentData = async () => {
    setIsLoading(true)
    try {
      // Fetch document
      const docRes = await fetch(`/api/documents/${documentId}`)
      const docData = await docRes.json()
      if (docData.success) {
        setDocument(docData.document)
      }

      // Fetch reviews
      const reviewRes = await fetch(`/api/document-reviews?documentId=${documentId}`)
      const reviewData = await reviewRes.json()
      if (reviewData.success) {
        setReviews(reviewData.reviews)
      }
    } catch (error) {
      console.error("[v0] Error fetching document:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitReview = async () => {
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/document-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId,
          status: reviewStatus,
          comments: comments || null,
          rejectionReason: rejectionReason || null,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setComments("")
        setRejectionReason("")
        fetchDocumentData()
        onRefresh()
        setShowConfirm(false)
      } else {
        alert("Error al enviar revisión: " + data.error)
      }
    } catch (error) {
      console.error("[v0] Error submitting review:", error)
      alert("Error al enviar revisión")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader className="w-6 h-6 animate-spin" />
      </div>
    )
  }

  if (!document) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Documento no encontrado
        </CardContent>
      </Card>
    )
  }

  const hasExistingReview = reviews.length > 0
  const lastReview = reviews[reviews.length - 1]

  return (
    <div className="space-y-6">
      <Button
        variant="outline"
        onClick={onClose}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver a la cola
      </Button>

      {/* Document Information */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{document.file_name}</CardTitle>
              <CardDescription>
                De: {document.profiles.full_name} ({document.profiles.email})
              </CardDescription>
            </div>
            <Badge variant="outline">{document.document_type}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Tipo de Documento</span>
              <p className="font-medium">{document.document_type}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Tamaño</span>
              <p className="font-medium">{document.file_size}</p>
            </div>
            {document.expiry_date && (
              <div>
                <span className="text-sm text-muted-foreground">Vencimiento</span>
                <p className="font-medium">
                  {new Date(document.expiry_date).toLocaleDateString()}
                </p>
              </div>
            )}
            <div>
              <span className="text-sm text-muted-foreground">Estado Actual</span>
              <Badge
                className={
                  document.validation_status === "approved"
                    ? "bg-green-100 text-green-800"
                    : document.validation_status === "rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                }
              >
                {document.validation_status}
              </Badge>
            </div>
          </div>

          {/* OCR Data Preview */}
          {document.ocrData && (
            <div className="border-t pt-4 space-y-2">
              <h4 className="font-semibold text-sm">Datos Extraídos (OCR)</h4>
              <div className="bg-muted p-3 rounded text-sm space-y-1">
                {Object.entries(document.ocrData).map(([key, value]: [string, any]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-muted-foreground">{key}:</span>
                    <span className="font-medium">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Previous Reviews */}
          {hasExistingReview && (
            <div className="border-t pt-4 space-y-2">
              <h4 className="font-semibold text-sm">Revisiones Anteriores</h4>
              <div className="space-y-2">
                {reviews.map((review, idx) => (
                  <div key={idx} className="border rounded p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {review.profiles?.full_name}
                      </span>
                      <Badge
                        className={
                          review.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : review.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                        }
                      >
                        {review.status}
                      </Badge>
                    </div>
                    {review.comments && (
                      <p className="text-sm text-muted-foreground">
                        Comentarios: {review.comments}
                      </p>
                    )}
                    {review.rejection_reason && (
                      <p className="text-sm text-red-600">
                        Razón del rechazo: {review.rejection_reason}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.reviewed_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Form */}
      {!hasExistingReview || lastReview?.status === "pending" ? (
        <Card>
          <CardHeader>
            <CardTitle>Enviar Revisión</CardTitle>
            <CardDescription>
              {hasExistingReview
                ? "Actualiza tu revisión anterior"
                : "Completa la revisión del documento"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Decisión</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    value: "in_progress",
                    label: "En Revisión",
                    icon: AlertCircle,
                  },
                  { value: "approved", label: "Aprobar", icon: CheckCircle },
                  { value: "rejected", label: "Rechazar", icon: XCircle },
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setReviewStatus(value as any)}
                    className={`p-3 rounded border-2 flex flex-col items-center gap-2 transition-all ${
                      reviewStatus === value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Comentarios</label>
              <Textarea
                placeholder="Añade comentarios sobre la revisión..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={3}
              />
            </div>

            {/* Rejection Reason */}
            {reviewStatus === "rejected" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-red-600">
                  Razón del Rechazo *
                </label>
                <Textarea
                  placeholder="Explica por qué se rechaza este documento..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  className="border-red-200 focus:border-red-500"
                />
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                onClick={() => setShowConfirm(true)}
                disabled={
                  isSubmitting ||
                  (reviewStatus === "rejected" && !rejectionReason)
                }
                className={
                  reviewStatus === "approved"
                    ? "bg-green-600 hover:bg-green-700"
                    : reviewStatus === "rejected"
                      ? "bg-red-600 hover:bg-red-700"
                      : ""
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  `Enviar Revisión`
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="py-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">
                  Revisión ya completada
                </p>
                <p className="text-sm text-green-700">
                  Este documento fue {lastReview?.status} por{" "}
                  {lastReview?.profiles?.full_name}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Revisión</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas{" "}
              {reviewStatus === "approved"
                ? "aprobar"
                : reviewStatus === "rejected"
                  ? "rechazar"
                  : "marcar como en revisión"}{" "}
              este documento?
              {reviewStatus === "rejected" && (
                <>
                  <br />
                  <br />
                  <strong>Razón del rechazo:</strong> {rejectionReason}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction
            onClick={handleSubmitReview}
            disabled={isSubmitting}
            className={
              reviewStatus === "approved"
                ? "bg-green-600 hover:bg-green-700"
                : reviewStatus === "rejected"
                  ? "bg-red-600 hover:bg-red-700"
                  : ""
            }
          >
            {isSubmitting ? "Enviando..." : "Confirmar"}
          </AlertDialogAction>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
