'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Bell, Send, CheckCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface PendingDocument {
  id: string
  subcontractor_id: string
  subcontractor_name: string
  subcontractor_phone: string
  document_type: string
  days_pending: number
  created_at: string
  status: string
  count: number
}

interface ReminderLog {
  id: string
  subcontractor_id: string
  subcontractor_name: string
  phone: string
  pending_count: number
  sent_at: string
  status: 'sent' | 'failed' | 'pending'
  error_message?: string
}

export default function RemindersPage() {
  const [pendingDocs, setPendingDocs] = useState<PendingDocument[]>([])
  const [reminderLogs, setReminderLogs] = useState<ReminderLog[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState<string | null>(null)
  const [filterDays, setFilterDays] = useState('7')
  const [sent, setSent] = useState(false)

  // Load pending documents
  useEffect(() => {
    async function loadPending() {
      setLoading(true)
      try {
        const res = await fetch(`/api/reminders/pending?days=${filterDays}`)
        if (res.ok) {
          const data = await res.json()
          setPendingDocs(data.pending || [])
        }
      } catch (error) {
        console.error('Error loading pending docs:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPending()
  }, [filterDays])

  // Load reminder logs
  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await fetch('/api/reminders/logs?limit=20')
        if (res.ok) {
          const data = await res.json()
          setReminderLogs(data.logs || [])
        }
      } catch (error) {
        console.error('Error loading logs:', error)
      }
    }

    loadLogs()
  }, [sent])

  const handleSendReminder = async (subcontractorId: string) => {
    setSending(subcontractorId)

    try {
      const res = await fetch('/api/reminders/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subcontractor_id: subcontractorId }),
      })

      if (res.ok) {
        setSent(!sent)
        alert('Recordatorio enviado exitosamente')
      } else {
        const error = await res.json()
        alert('Error: ' + (error.error || 'Error desconocido'))
      }
    } catch (error) {
      alert('Error enviando recordatorio: ' + (error instanceof Error ? error.message : 'Unknown'))
    } finally {
      setSending(null)
    }
  }

  const handleSendAll = async () => {
    if (!confirm(`Enviar recordatorios a ${pendingDocs.length} subcontratistas?`)) return

    for (const doc of pendingDocs) {
      await handleSendReminder(doc.subcontractor_id)
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Bell className="w-8 h-8 text-amber-500" />
            <h1 className="text-4xl font-bold text-slate-100">Recordatorios Automáticos</h1>
          </div>
          <p className="text-slate-400">Envía recordatorios a subcontratistas sobre documentos pendientes</p>
        </div>

        {/* Filter and Actions */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg">Filtrar Documentos Pendientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-sm text-slate-300 mb-2 block">
                  Mostrar documentos pendientes desde hace (días)
                </label>
                <Input
                  type="number"
                  value={filterDays}
                  onChange={(e) => setFilterDays(e.target.value)}
                  className="bg-slate-800 border-slate-600 text-slate-100"
                  min="1"
                  max="365"
                />
              </div>
              <Button
                onClick={() => setLoading(true)}
                variant="outline"
                className="border-slate-600 text-slate-300"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Actualizar
              </Button>
            </div>
            <p className="text-xs text-slate-400">
              Encontrados {pendingDocs.length} documentos pendientes en {new Set(pendingDocs.map(d => d.subcontractor_id)).size} subcontratistas
            </p>
          </CardContent>
        </Card>

        {/* Pending Documents */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Documentos Pendientes</CardTitle>
              <CardDescription>Subcontratistas con documentos que requieren acción</CardDescription>
            </div>
            {pendingDocs.length > 0 && (
              <Button
                onClick={handleSendAll}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                Enviar a Todos
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : pendingDocs.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                Sin documentos pendientes en los últimos {filterDays} días
              </div>
            ) : (
              <div className="space-y-3">
                {pendingDocs.map(doc => (
                  <div
                    key={doc.id}
                    className="bg-slate-800/50 p-4 rounded-lg flex items-center justify-between border border-slate-700"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-100">{doc.subcontractor_name}</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        {doc.count} documento(s) pendiente(s) • {doc.days_pending} días
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {doc.document_type}
                        </Badge>
                        <Badge
                          className={`text-xs ${
                            doc.days_pending > 30
                              ? 'bg-red-500/20 text-red-300'
                              : doc.days_pending > 14
                              ? 'bg-orange-500/20 text-orange-300'
                              : 'bg-yellow-500/20 text-yellow-300'
                          }`}
                        >
                          {doc.days_pending} días
                        </Badge>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleSendReminder(doc.subcontractor_id)}
                      disabled={sending === doc.subcontractor_id}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {sending === doc.subcontractor_id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 mr-1" />
                      )}
                      Enviar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reminder History */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg">Historial de Recordatorios</CardTitle>
            <CardDescription>Últimos recordatorios enviados</CardDescription>
          </CardHeader>
          <CardContent>
            {reminderLogs.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                Sin recordatorios enviados aún
              </div>
            ) : (
              <div className="space-y-2">
                {reminderLogs.map(log => (
                  <div
                    key={log.id}
                    className="bg-slate-800/50 p-3 rounded flex items-center justify-between text-sm border border-slate-700"
                  >
                    <div className="flex-1">
                      <p className="text-slate-100 font-medium">{log.subcontractor_name}</p>
                      <p className="text-xs text-slate-400">
                        {log.pending_count} documento(s) • {new Date(log.sent_at).toLocaleString('es-CL')}
                      </p>
                    </div>
                    {log.status === 'sent' ? (
                      <Badge className="bg-green-500/20 text-green-300 flex gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Enviado
                      </Badge>
                    ) : log.status === 'failed' ? (
                      <Badge className="bg-red-500/20 text-red-300 flex gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Error
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-500/20 text-yellow-300">Pendiente</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
