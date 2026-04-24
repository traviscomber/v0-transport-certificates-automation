'use client'

import { useState } from 'react'
import { Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AdminDocumentUploadProps {
  onUploadSuccess?: () => void
}

export function AdminDocumentUpload({ onUploadSuccess }: AdminDocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [documentType, setDocumentType] = useState<'driver' | 'subcontractor'>('driver')
  const [selectedId, setSelectedId] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Licencia de Conducir')

  // Categorías completas para cumplimiento regulatorio en Chile (40+ tipos)
  const driverCategories = [
    'Licencia de Conducir',
    'Licencia de Conducir - Clase A1',
    'Licencia de Conducir - Clase A2',
    'Licencia de Conducir - Clase A3',
    'Licencia de Conducir - Clase B',
    'Licencia de Conducir - Clase C',
    'Licencia de Conducir - Clase D',
    'Licencia de Conducir - Clase E',
    'Licencia de Conducir - Clase F',
    'Certificado Médico',
    'Certificado de Antecedentes',
    'Póliza de Seguros',
    'Certificado de Capacitación',
    'Certificado de Competencia de Transporte',
    'Certificado de Manejo Defensivo',
    'Curso de Seguridad Vial',
    'Certificado de Entrenamiento en Materiales Peligrosos',
    'Revisión Técnica (RTV)',
    'Informe de Inspección',
    'Declaración de Impuestos (Año Anterior)',
    'Comprobante de Residencia',
    'Certificado de Afiliación AFP',
    'Comprobante de Salud',
    'Documento de Identidad (Cédula)',
    'Pasaporte',
    'Certificado de Vigencia de Licencia',
    'Contrato de Transporte',
    'Autorización de SENCE',
    'Acreditación de Empresa',
    'Declaración de Ingresos',
    'Estado de Cuenta Bancaria',
    'Referencia Laboral',
    'Historial de Tránsito',
    'Antecedentes Penales',
    'Autorización Rut',
    'Certificado de Cumplimiento Laboral',
    'Documento Adicional'
  ]

  const subcontractorCategories = [
    'Póliza de Seguros General',
    'Certificado de Vigencia de Seguros',
    'Contrato Vigente',
    'RUT (Comprobante)',
    'Certificado de Vigencia RUT',
    'Resolución de Constitución',
    'Escritura de Constitución',
    'Certificado de Vigencia Tributaria',
    'Certificado de Antecedentes Tributarios',
    'Declaración de Renta',
    'Balances Financieros',
    'Estados de Cuenta',
    'Certificado de Afiliación SEC',
    'Acreditación de Laborales',
    'Certificado de Cumplimiento Laboral',
    'Licencia de Actividades Económicas',
    'Autorización de Funcionamiento',
    'Certificado de Vigencia Laboral',
    'Póliza de Responsabilidad Civil',
    'Póliza de Cobertura Accidentes',
    'Certificado de Cobertura Ambiental',
    'Certificado de Seguridad Ocupacional',
    'Permiso de Operación de Vehículos',
    'Autorización de Transporte de Carga',
    'Certificado de Logística Inversa',
    'Autorización de Materiales Peligrosos',
    'Certificado ISO',
    'Informe de Auditoría',
    'Certificado de Cumplimiento Normativo',
    'Resolución Sanitaria',
    'Autorización Ambiental',
    'Certificado de Trazabilidad',
    'Contrato de Asociación',
    'Alianza Estratégica',
    'Contrato con Cliente Principal',
    'Declaración de Ingresos',
    'Autorización de Funciones',
    'Comprobante de Domicilio',
    'Referencias Comerciales',
    'Historial de Cumplimiento',
    'Documento Adicional'
  ]

  const categories = documentType === 'driver' ? driverCategories : subcontractorCategories

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleFiles = async (files: FileList) => {
    if (files.length === 0 || !selectedId) {
      setMessage({ type: 'error', text: 'Selecciona un ID y archivos' })
      return
    }

    setUploading(true)
    setMessage(null)

    const formData = new FormData()
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i])
    }
    
    // Enviar parámetros según el tipo
    if (documentType === 'driver') {
      formData.append('driverRut', selectedId)
    } else {
      formData.append('subcontractorId', selectedId)
    }
    
    formData.append('category', selectedCategory)

    try {
      const endpoint = documentType === 'driver' 
        ? '/api/company/documents/drivers/upload'
        : '/api/company/documents/subcontractors/upload'

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error uploading document')
      }

      setMessage({ type: 'success', text: `${files.length} documento(s) subido(s) exitosamente` })
      setSelectedId('')
      onUploadSuccess?.()
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Error al subir documento'
      })
    } finally {
      setUploading(false)
      setIsDragging(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-white">Cargar Documentos (Admin)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {/* Type Selection */}
          <div>
            <label className="text-sm font-semibold text-white block mb-2">Tipo de Documento</label>
            <select
              value={documentType}
              onChange={(e) => {
                setDocumentType(e.target.value as 'driver' | 'subcontractor')
                setSelectedCategory(documentType === 'driver' ? 'Licencia de Conducir' : 'Póliza de Seguros General')
              }}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="driver">Conductor</option>
              <option value="subcontractor">Subcontratista</option>
            </select>
          </div>

          {/* ID Input */}
          <div>
            <label className="text-sm font-semibold text-white block mb-2">RUT / ID</label>
            <input
              type="text"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              placeholder="Ingresa RUT o ID..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-white placeholder-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Category Selection */}
          <div>
            <label className="text-sm font-semibold text-white block mb-2">Tipo de Documento</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Drag and Drop Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={(e) => {
            e.preventDefault()
            handleFiles(e.dataTransfer.files)
          }}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-orange-500 bg-orange-500/10'
              : 'border-slate-600 bg-slate-800/50'
          }`}
        >
          <Upload className="mx-auto h-8 w-8 text-orange-400 mb-2" />
          <p className="text-sm font-semibold text-white">
            Arrastra archivos aquí o haz clic para seleccionar
          </p>
          <p className="text-xs text-slate-400 mt-1">
            PDF, JPG, PNG, DOCX, XLSX - Máximo 50MB
          </p>
          <input
            type="file"
            multiple
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="hidden"
            id="file-input"
            accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx"
            disabled={uploading}
          />
          <label htmlFor="file-input" className="block mt-4">
            <Button 
              disabled={uploading || !selectedId} 
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold"
              type="button"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                'Seleccionar Archivos'
              )}
            </Button>
          </label>
        </div>

        {/* Message */}
        {message && (
          <div className={`flex gap-2 p-3 rounded-md ${
            message.type === 'success'
              ? 'bg-green-500/20 border border-green-500/50 text-green-100'
              : 'bg-red-500/20 border border-red-500/50 text-red-100'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-400" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400" />
            )}
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
