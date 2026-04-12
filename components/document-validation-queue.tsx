'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, Clock, Eye, CheckCheck, X as XIcon } from 'lucide-react'
import { type DocumentValidationTask } from '@/lib/data/document-upload-types'

interface ValidationQueueProps {
  readonly?: boolean
}

export function DocumentValidationQueue({ readonly = false }: ValidationQueueProps) {
  const [validationTasks, setValidationTasks] = useState<DocumentValidationTask[]>([
    {
      id: 'task-001',
      documentId: 'doc-001',
      document: {
        id: 'doc-001',
        filename: 'licencia_juan_1234567-9.pdf',
        originalName: 'Mi Licencia.pdf',
        size: 2560000,
        mimeType: 'application/pdf',
        uploadedBy: 'Juan Vargas',
        uploadedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        entityType: 'conductor',
        entityId: '18642287-0',
        entityName: 'Juan Vargas',
        documentType: 'licencia',
        expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        fileUrl: '#',
      },
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      priority: 'high',
      checklist: {
        readability: true,
        dataMatches: true,
        validDateRange: null,
        properFormat: true,
      },
      notes: '',
      status: 'pending',
    },
    {
      id: 'task-002',
      documentId: 'doc-002',
      document: {
        id: 'doc-002',
        filename: 'revision_tecnica_truck_HJKL-23.pdf',
        originalName: 'Certificado RT.pdf',
        size: 3200000,
        mimeType: 'application/pdf',
        uploadedBy: 'Diego González',
        uploadedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        entityType: 'vehiculo',
        entityId: 'HJKL-23',
        entityName: 'Volquete HJKL-23',
        documentType: 'revision_tecnica',
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'validating',
        validatedBy: 'Carlos Muñoz',
        validatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        fileUrl: '#',
      },
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      priority: 'urgent',
      checklist: {
        readability: true,
        dataMatches: true,
        validDateRange: true,
        properFormat: true,
      },
      notes: 'Verificando datos con plataforma de permisos',
      status: 'in_progress',
    },
  ])

  const [selectedTask, setSelectedTask] = useState<DocumentValidationTask | null>(null)
  const [showValidationForm, setShowValidationForm] = useState(false)
  const [checklist, setChecklist] = useState<Record<string, boolean | null>>({})

  const pendingCount = validationTasks.filter(t => t.status === 'pending').length
  const inProgressCount = validationTasks.filter(t => t.status === 'in_progress').length

  const handleApprove = (taskId: string) => {
    setValidationTasks(prev => prev.map(task => 
      task.id === taskId
        ? {
            ...task,
            status: 'completed',
            document: { ...task.document, status: 'approved' }
          }
        : task
    ))
    setShowValidationForm(false)
    setSelectedTask(null)
  }

  const handleReject = (taskId: string, reason: string) => {
    setValidationTasks(prev => prev.map(task => 
      task.id === taskId
        ? {
            ...task,
            status: 'completed',
            document: {
              ...task.document,
              status: 'rejected',
              rejectionReason: reason
            }
          }
        : task
    ))
    setShowValidationForm(false)
    setSelectedTask(null)
  }

  const getPriorityIcon = (priority: string) => {
    if (priority === 'urgent') return <AlertCircle className="w-4 h-4 text-red-600" />
    if (priority === 'high') return <AlertCircle className="w-4 h-4 text-amber-600" />
    return <Clock className="w-4 h-4 text-slate-600" />
  }

  const getStatusIcon = (status: string) => {
    if (status === 'completed') return <CheckCircle className="w-4 h-4 text-green-600" />
    if (status === 'in_progress') return <Clock className="w-4 h-4 text-blue-600" />
    return <Eye className="w-4 h-4 text-slate-600" />
  }

  return (
    <div className="space-y-6">
      {/* Header con contadores */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{pendingCount}</div>
              <p className="text-sm text-slate-600">Pendientes de revisar</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{inProgressCount}</div>
              <p className="text-sm text-slate-600">En validación</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{validationTasks.filter(t => t.status === 'completed').length}</div>
              <p className="text-sm text-slate-600">Completados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cola de validación */}
      <Card>
        <CardHeader>
          <CardTitle>Cola de validación de documentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {validationTasks.map((task) => (
              <div
                key={task.id}
                className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedTask(task)
                  setShowValidationForm(true)
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex gap-2 flex-shrink-0 pt-1">
                      {getPriorityIcon(task.priority)}
                      {getStatusIcon(task.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-slate-900 truncate">{task.document.originalName}</h4>
                        <Badge className={`text-xs whitespace-nowrap ${
                          task.status === 'pending' ? 'bg-slate-100 text-slate-800' :
                          task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.status === 'pending' ? 'Pendiente' : task.status === 'in_progress' ? 'Validando' : 'Completado'}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-700 mb-1">{task.document.entityName}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>Tipo: {task.document.documentType}</span>
                        <span>Subido: {new Date(task.document.uploadedAt).toLocaleString('es-CL')}</span>
                        <span>Vence: {new Date(task.document.expiryDate).toLocaleDateString('es-CL')}</span>
                      </div>
                    </div>
                  </div>
                  {!readonly && task.status === 'pending' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedTask(task)
                        setShowValidationForm(true)
                      }}
                      className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Validar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de validación */}
      {showValidationForm && selectedTask && !readonly && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader className="sticky top-0 bg-white border-b flex items-center justify-between">
              <CardTitle>Validar documento</CardTitle>
              <button
                onClick={() => setShowValidationForm(false)}
                className="text-slate-600 hover:text-slate-900"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </CardHeader>

            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Información del documento */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Información del documento</h3>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded">
                    <div>
                      <p className="text-xs text-slate-600">Archivo</p>
                      <p className="text-sm font-medium text-slate-900">{selectedTask.document.originalName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Entidad</p>
                      <p className="text-sm font-medium text-slate-900">{selectedTask.document.entityName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Tipo</p>
                      <p className="text-sm font-medium text-slate-900">{selectedTask.document.documentType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Vencimiento</p>
                      <p className="text-sm font-medium text-slate-900">{new Date(selectedTask.document.expiryDate).toLocaleDateString('es-CL')}</p>
                    </div>
                  </div>
                </div>

                {/* Checklist de validación */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Checklist de validación</h3>
                  <div className="space-y-2">
                    {[
                      { key: 'readability', label: 'Documento legible' },
                      { key: 'dataMatches', label: 'Datos coinciden con registro' },
                      { key: 'validDateRange', label: 'Rango de fechas válido' },
                      { key: 'properFormat', label: 'Formato correcto' },
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded">
                        <input
                          type="checkbox"
                          checked={selectedTask.checklist[key as keyof typeof selectedTask.checklist] || false}
                          readOnly
                          className="rounded"
                        />
                        <span className="text-sm text-slate-700">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Notas */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Notas adicionales</label>
                  <textarea
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    rows={4}
                    placeholder="Observaciones o comentarios sobre la validación..."
                  />
                </div>

                {/* Botones de acción */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(selectedTask.id)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <CheckCheck className="w-4 h-4" />
                    Aprobar documento
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('¿Motivo del rechazo?')
                      if (reason) handleReject(selectedTask.id, reason)
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Rechazar
                  </button>
                  <button
                    onClick={() => setShowValidationForm(false)}
                    className="flex-1 px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
