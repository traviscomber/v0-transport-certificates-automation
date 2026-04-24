'use client'

import { useState } from 'react'
import { useDocumentManagement } from '@/hooks/use-document-management'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Document {
  id: string
  file_name: string
  document_type: string
  custom_code?: string
  expiration_date?: string
  status?: string
  upload_date: string
}

interface DocumentManagementPanelProps {
  document: Document
  companyCode: string
  driverRut: string
  onUpdate?: () => void
}

export function DocumentManagementPanel({
  document,
  companyCode,
  driverRut,
  onUpdate
}: DocumentManagementPanelProps) {
  const { changeStatus, updateMetadata, generateCode, loading } = useDocumentManagement()
  const [customCode, setCustomCode] = useState(document.custom_code || '')
  const [expirationDate, setExpirationDate] = useState(document.expiration_date || '')
  const [selectedStatus, setSelectedStatus] = useState(document.status || 'pending')
  const [changeReason, setChangeReason] = useState('')

  const statusOptions = [
    { value: 'pending', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'approved', label: 'Aprobado', color: 'bg-green-100 text-green-800' },
    { value: 'rejected', label: 'Rechazado', color: 'bg-red-100 text-red-800' },
    { value: 'expired', label: 'Vencido', color: 'bg-gray-100 text-gray-800' }
  ]

  const handleChangeStatus = async () => {
    try {
      await changeStatus(document.id, selectedStatus, changeReason)
      setChangeReason('')
      onUpdate?.()
    } catch (error) {
      console.error('Error changing status:', error)
    }
  }

  const handleGenerateCode = async () => {
    try {
      const newCode = await generateCode(document.id, companyCode, driverRut, document.document_type)
      setCustomCode(newCode)
      onUpdate?.()
    } catch (error) {
      console.error('Error generating code:', error)
    }
  }

  const handleUpdateMetadata = async () => {
    try {
      await updateMetadata(document.id, customCode, expirationDate)
      onUpdate?.()
    } catch (error) {
      console.error('Error updating metadata:', error)
    }
  }

  const getStatusColor = (status: string) => {
    const option = statusOptions.find(s => s.value === status)
    return option?.color || 'bg-gray-100 text-gray-800'
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">{document.file_name}</CardTitle>
        <CardDescription>{document.document_type}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Estado Actual */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Estado Actual</label>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(document.status || 'pending')}>
              {statusOptions.find(s => s.value === document.status)?.label || 'Pendiente'}
            </Badge>
          </div>
        </div>

        {/* Cambiar Estado */}
        <div className="space-y-3 border-t pt-4">
          <label className="text-sm font-medium">Cambiar Estado</label>
          <div className="flex gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md text-sm"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <Input
            placeholder="Motivo del cambio (opcional)"
            value={changeReason}
            onChange={(e) => setChangeReason(e.target.value)}
            className="text-sm"
          />
          <Button
            onClick={handleChangeStatus}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Procesando...' : 'Aplicar Cambio'}
          </Button>
        </div>

        {/* Código del Documento */}
        <div className="space-y-3 border-t pt-4">
          <label className="text-sm font-medium">Código del Documento</label>
          <div className="flex gap-2">
            <Input
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              placeholder="Código personalizado"
              className="text-sm"
            />
            <Button
              onClick={handleGenerateCode}
              disabled={loading}
              variant="outline"
              className="text-sm"
            >
              Generar
            </Button>
          </div>
          {customCode && (
            <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
              Código actual: <code className="font-mono font-bold">{customCode}</code>
            </div>
          )}
        </div>

        {/* Fecha de Vencimiento */}
        <div className="space-y-3 border-t pt-4">
          <label className="text-sm font-medium">Fecha de Vencimiento</label>
          <Input
            type="date"
            value={expirationDate.split('T')[0] || ''}
            onChange={(e) => setExpirationDate(e.target.value)}
            className="text-sm"
          />
          {expirationDate && (
            <div className="text-xs text-gray-500">
              Vence: {new Date(expirationDate).toLocaleDateString('es-CL')}
            </div>
          )}
          <Button
            onClick={handleUpdateMetadata}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Guardando...' : 'Guardar Información'}
          </Button>
        </div>

        {/* Información del Documento */}
        <div className="space-y-2 border-t pt-4 text-xs text-gray-500">
          <div>ID: {document.id}</div>
          <div>Subido: {new Date(document.upload_date).toLocaleDateString('es-CL')}</div>
          <div>Tipo: {document.document_type}</div>
        </div>
      </CardContent>
    </Card>
  )
}
