export const dynamic = 'force-dynamic'
export const revalidate = 0

import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { ExternalLink, ShieldCheck, AlertTriangle, RefreshCw, FileSearch, CheckCircle2 } from 'lucide-react'
import { OcrReviewActions } from '@/components/admin/ocr-review-actions'

function number(value: unknown): number {
  const parsed = Number(value ?? 0)
  return Number.isFinite(parsed) ? parsed : 0
}

function statusClass(status: string | null) {
  if (status === 'text_extracted' || status === 'matched' || status === 'not_vehicle_related') return 'text-emerald-400'
  if (status === 'failed' || status === 'owner_conflict') return 'text-red-400'
  return 'text-amber-400'
}

export default async function OcrOperationsPage() {
  const supabase = await createClient()
  const [{ data: summary }, { data: queue }, { data: reviews }] = await Promise.all([
    supabase.from('ocr_operational_summary').select('*').maybeSingle(),
    supabase
      .from('ocr_review_queue')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(50),
    supabase
      .from('ocr_manual_reviews')
      .select('id, document_id, action, created_at')
      .order('created_at', { ascending: false })
      .limit(12),
  ])

  const metrics = [
    { label: 'Texto extraído', value: number(summary?.text_extracted), icon: CheckCircle2 },
    { label: 'OCR pendiente', value: number(summary?.ocr_required), icon: FileSearch },
    { label: 'Retry', value: number(summary?.queued_retry), icon: RefreshCw },
    { label: 'En proceso', value: number(summary?.processing), icon: RefreshCw },
    { label: 'Requiere foto vehicular', value: number(summary?.requires_new_photo), icon: ShieldCheck },
    { label: 'Fallos OCR', value: number(summary?.failed), icon: AlertTriangle },
    { label: 'PDF pendientes', value: number(summary?.pending_current_pdfs), icon: FileSearch },
    { label: 'Batches PDF completos', value: number(summary?.completed_pdf_batches), icon: CheckCircle2 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Operación OCR</h1>
        <p className="text-muted-foreground">
          Monitoreo y revisión humana. La validación avanzada agrega badge; su ausencia no invalida el cumplimiento base.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="border-slate-700/60 bg-slate-900/50">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
                <p className="mt-1 text-3xl font-semibold">{value.toLocaleString('es-CL')}</p>
              </div>
              <Icon className="h-5 w-5 text-orange-400" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-slate-700/60 bg-slate-900/50">
        <CardContent className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Cola de revisión</h2>
              <p className="text-sm text-muted-foreground">Solo casos que requieren atención OCR o canonicalización.</p>
            </div>
            <span className="text-sm text-muted-foreground">Mostrando {queue?.length ?? 0}</span>
          </div>

          <div className="space-y-4">
            {(queue ?? []).map((item) => (
              <div key={item.document_id} className="rounded-lg border border-slate-700/60 bg-slate-950/50 p-4">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{item.file_name || 'Documento sin nombre'}</p>
                      <span className={`text-xs font-medium ${statusClass(item.extraction_status)}`}>
                        {item.extraction_status || 'sin estado'}
                      </span>
                      {item.canonical_status && (
                        <span className={`text-xs font-medium ${statusClass(item.canonical_status)}`}>
                          {item.canonical_status}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">intentos: {item.attempts ?? 0}</span>
                    </div>

                    {item.error_message && (
                      <p className="rounded bg-red-950/30 px-3 py-2 text-xs text-red-300">{item.error_message}</p>
                    )}

                    <div className="grid gap-3 lg:grid-cols-2">
                      <div>
                        <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Texto OCR actual</p>
                        <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded bg-slate-950 p-3 text-xs text-slate-300">
                          {item.ai_extracted_text || 'Sin texto extraído'}
                        </pre>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <p>Confianza: {item.ai_confidence == null ? '—' : Number(item.ai_confidence).toFixed(2)}</p>
                        <p>Candidatos patente: {item.candidate_count ?? 0}</p>
                        <p>Matches: {item.matched_count ?? 0}</p>
                        <p>Prioridad: {item.review_priority || '—'}</p>
                        {item.file_url && (
                          <Link
                            href={item.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 inline-flex items-center gap-1 text-orange-400 hover:text-orange-300"
                          >
                            Abrir evidencia original <ExternalLink className="h-3 w-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="xl:w-[430px]">
                    <OcrReviewActions documentId={item.document_id} currentText={item.ai_extracted_text} />
                  </div>
                </div>
              </div>
            ))}

            {(queue?.length ?? 0) === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">No hay documentos esperando revisión.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-700/60 bg-slate-900/50">
        <CardContent className="p-5">
          <h2 className="mb-3 text-lg font-semibold">Últimas decisiones auditadas</h2>
          <div className="space-y-2 text-sm">
            {(reviews ?? []).map((review) => (
              <div key={review.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 py-2 last:border-0">
                <span className="font-mono text-xs text-slate-400">{review.document_id}</span>
                <span>{review.action}</span>
                <span className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleString('es-CL')}</span>
              </div>
            ))}
            {(reviews?.length ?? 0) === 0 && <p className="text-muted-foreground">Aún no hay decisiones manuales.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
