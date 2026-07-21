'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, CheckCircle, Clock, LogOut, Upload, FileText, HelpCircle, Calendar } from 'lucide-react'
import { HelpBox } from '@/components/ui/help-box'
import { getDocumentPeriodDate, getDocumentPeriodLabel } from '@/lib/document-period'

interface DocumentType {
  id: string
  code: string
  nombre: string
  periodicidad: string
}

interface Document {
  id: string
  document_type_id: string
  file_name: string
  status: string
  uploaded_at: string
  document_period_month?: number | string | null
  document_period_year?: number | string | null
  document_period_start?: string | null
  expires_at: string
  rejection_reason?: string
}

interface TransportistaData {
  id: string
  rut: string
  nombre: string
}

export default function SubcontractorDashboardPage() {
  const router = useRouter()
  const [transportista, setTransportista] = useState<TransportistaData | null>(null)
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedDocType, setSelectedDocType] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState('')
  const [loading, setLoading] = useState(true)
  const today = new Date()
  const [selectedMonth, setSelectedMonth] = useState(String(today.getMonth() + 1).padStart(2, '0'))
  const [selectedYear, setSelectedYear] = useState(String(today.getFullYear()))
  const [documentDate, setDocumentDate] = useState(new Date().toISOString().split('T')[0])

  const syncDocumentDateToPeriod = (month: string, year: string) => {
    setDocumentDate(`${year}-${month.padStart(2, '0')}-01`)
  }

  const handleSelectedMonthChange = (month: string) => {
    setSelectedMonth(month)
    syncDocumentDateToPeriod(month, selectedYear)
  }

  const handleSelectedYearChange = (year: string) => {
    setSelectedYear(year)
    syncDocumentDateToPeriod(selectedMonth, year)
  }

  const handleDocumentDateChange = (value: string) => {
    setDocumentDate(value)
    const match = /^(\d{4})-(\d{2})-\d{2}$/.exec(value)
    if (match) {
      setSelectedYear(match[1])
      setSelectedMonth(match[2])
    }
  }

  useEffect(() => {
    // Get transportista info from cookies/session
    fetchTransportistaData()
  }, [])

  const fetchTransportistaData = async () => {
    try {
      const response = await fetch('/api/auth/subcontractors/profile')
      if (!response.ok) {
        router.push('/subcontractors/login')
        return
      }
      const data = await response.json()
      setTransportista(data.transportista)
      
      // Fetch document types and documents
      if (data.transportista?.id) {
        await Promise.all([
          fetchDocumentTypes(),
          fetchDocuments(data.transportista.id)
        ])
      }
    } catch (error) {
      console.error('[v0] Error fetching profile:', error)
      router.push('/subcontractors/login')
    } finally {
      setLoading(false)
    }
  }

  const fetchDocumentTypes = async () => {
    try {
      const response = await fetch('/api/subcontractor-document-types')
      if (response.ok) {
        const data = await response.json()
        setDocumentTypes(data.documentTypes || [])
      }
    } catch (error) {
      console.error('[v0] Error fetching document types:', error)
    }
  }

  const fetchDocuments = async (transportistaId: string) => {
    try {
      const response = await fetch(`/api/subcontractors/${transportistaId}/documents`)
      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents || [])
      }
    } catch (error) {
      console.error('[v0] Error fetching documents:', error)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validaciones profesionales
      const maxSize = 50 * 1024 * 1024 // 50MB
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
      
      if (!allowedTypes.includes(file.type)) {
        setUploadError('Solo se permiten: PDF, JPG, PNG')
        return
      }
      
      if (file.size > maxSize) {
        setUploadError(`Archivo muy grande. Máximo: 50MB. Tu archivo: ${(file.size / 1024 / 1024).toFixed(2)}MB`)
        return
      }

      if (file.size === 0) {
        setUploadError('El archivo está vacío')
        return
      }

      setSelectedFile(file)
      setUploadError('')
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFile || !selectedDocType || !transportista) {
      setUploadError('Por favor completa todos los campos')
      return
    }

    setUploading(true)
    setUploadError('')
    setUploadSuccess('')

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('documentTypeId', selectedDocType)
      formData.append('subcontractorRut', transportista.rut)
      formData.append('documentDate', documentDate)
      formData.append('documentPeriodMonth', selectedMonth)
      formData.append('documentPeriodYear', selectedYear)

      console.log('[v0] Uploading file:', {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
        documentTypeId: selectedDocType
      })

      const response = await fetch(
        `/api/subcontractors/${transportista.id}/documents`,
        {
          method: 'POST',
          body: formData,
        }
      )

      console.log('[v0] Upload response status:', response.status)
      const data = await response.json()
      console.log('[v0] Upload response data:', data)

      if (!response.ok) {
        const errorMsg = data.error || 'Error al subir el documento'
        console.error('[v0] Upload failed:', errorMsg)
        setUploadError(errorMsg)
        return
      }

      console.log('[v0] Upload successful:', data)
      setUploadSuccess('Documento subido exitosamente')
      setSelectedFile(null)
      setSelectedDocType('')
      
      // Clear file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      if (fileInput) fileInput.value = ''
      
      // Refetch documents
      await fetchDocuments(transportista.id)
      
      // Clear success message after 5 seconds
      setTimeout(() => setUploadSuccess(''), 5000)

    } catch (error) {
      console.error('[v0] Upload error:', error)
      setUploadError('Error al subir el documento. Intenta nuevamente.')
    } finally {
      setUploading(false)
    }
  }

  const handleLogout = () => {
    fetch('/api/auth/subcontractors/logout', { method: 'POST' })
    router.push('/subcontractors/login')
  }

  // Get date range for selected month/year
  const getDateRangeForPeriod = (month: string, year: string) => {
    const monthNum = parseInt(month, 10)
    const yearNum = parseInt(year, 10)
    const startDate = new Date(yearNum, monthNum - 1, 1) // First day of selected month
    const endDate = new Date(yearNum, monthNum, 0) // Last day of selected month
    return { start: startDate, end: endDate }
  }

  // Filter documents by selected period
  const filteredDocuments = documents.filter((doc) => {
    const docDate = new Date(getDocumentPeriodDate(doc) || doc.uploaded_at)
    const { start, end } = getDateRangeForPeriod(selectedMonth, selectedYear)
    return docDate >= start && docDate <= end
  })

  // Get min date for document date picker (4 months ago)
  const minDate = new Date()
  minDate.setMonth(minDate.getMonth() - 4)
  const minDateString = minDate.toISOString().split('T')[0]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <div className="flex items-center gap-1 text-green-400"><CheckCircle className="w-4 h-4" /> Aprobado</div>
      case 'uploaded':
        return <div className="flex items-center gap-1 text-blue-400"><Clock className="w-4 h-4" /> Bajo revisión</div>
      case 'expired':
        return <div className="flex items-center gap-1 text-red-400"><AlertCircle className="w-4 h-4" /> Vencido</div>
      case 'rejected':
        return <div className="flex items-center gap-1 text-red-500"><AlertCircle className="w-4 h-4" /> Rechazado</div>
      default:
        return <span className="text-slate-400">{status}</span>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-slate-400">Cargando...</p>
      </div>
    )
  }

  if (!transportista) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Onboarding Help Box */}
        <HelpBox
          variant="info"
          title="Portal de Subcontratistas - Gestión de Documentos"
          description="Sistema para subir, gestionar y monitorear el estado de documentos requeridos por la empresa de transporte."
          tips={[
            "Selecciona el tipo de documento en el dropdown y adjunta el archivo (PDF, JPG o PNG máximo 50MB).",
            "VERDE 'Aprobado' = documento validado y activo. AZUL 'Bajo revisión' = tu documento fue recibido y está siendo validado.",
            "ROJO 'Rechazado' = revisa el motivo del rechazo y sube nuevamente. ROJO 'Vencido' = renueva el documento antes de la fecha indicada.",
            "Los documentos expiran según su período de validez. Recibe notificaciones cuando próximas renovaciones se acerquen.",
            "Mantén todos los documentos actualizados para mantener tu estado activo en la plataforma.",
            "Si tienes dudas, contacta con tu ejecutiva asignada en la empresa de transporte."
          ]}
        />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{transportista.nombre}</h1>
            <p className="text-slate-400">RUT: {transportista.rut}</p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </Button>
        </div>

        {/* Period Selector */}
        <Card className="border-slate-700 bg-slate-800/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Calendar className="w-5 h-5 text-slate-400" />
              <label className="text-sm font-medium text-slate-300">
                Selecciona Período:
              </label>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-slate-400 mb-1 block">Mes</label>
                  <select 
                    value={selectedMonth}
                    onChange={(e) => handleSelectedMonthChange(e.target.value)}
                    className="w-full rounded-md border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-white"
                  >
                    <option value="01">Enero</option>
                    <option value="02">Febrero</option>
                    <option value="03">Marzo</option>
                    <option value="04">Abril</option>
                    <option value="05">Mayo</option>
                    <option value="06">Junio</option>
                    <option value="07">Julio</option>
                    <option value="08">Agosto</option>
                    <option value="09">Septiembre</option>
                    <option value="10">Octubre</option>
                    <option value="11">Noviembre</option>
                    <option value="12">Diciembre</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-xs font-semibold text-slate-400 mb-1 block">Año</label>
                  <select 
                    value={selectedYear}
                    onChange={(e) => handleSelectedYearChange(e.target.value)}
                    className="w-full rounded-md border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-white"
                  >
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload Section */}
        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Subir Documento
            </CardTitle>
            <CardDescription>
              Selecciona el tipo de documento y adjunta el archivo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4">
              {uploadError && (
                <div className="flex gap-3 rounded-lg bg-red-500/10 border border-red-500/30 p-3">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-300">{uploadError}</p>
                </div>
              )}

              {uploadSuccess && (
                <div className="flex gap-3 rounded-lg bg-green-500/10 border border-green-500/30 p-3">
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <p className="text-sm text-green-300">{uploadSuccess}</p>
                </div>
              )}

              {/* Test Data Notice */}
              {documents.some(d => d.rejection_reason === 'test') && (
                <div className="flex gap-3 rounded-lg bg-blue-500/10 border border-blue-500/30 p-3">
                  <HelpCircle className="h-5 w-5 text-blue-400 flex-shrink-0" />
                  <p className="text-sm text-blue-300">
                    <strong>Nota:</strong> Algunos documentos con motivo de rechazo "test" son documentos de prueba del sistema y pueden ser ignorados.
                  </p>
                </div>
              )}

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="doctype" className="text-slate-200">
                    Tipo de Documento
                  </Label>
                  <Select value={selectedDocType} onValueChange={setSelectedDocType}>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue placeholder="Selecciona un documento" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {documentTypes.map((dt) => (
                        <SelectItem key={dt.id} value={dt.id} className="text-white">
                          {dt.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="docdate" className="text-slate-200">
                    Fecha del Documento
                  </Label>
                  <Input
                    id="docdate"
                    type="date"
                    value={documentDate}
                    onChange={(e) => handleDocumentDateChange(e.target.value)}
                    min={minDateString}
                    max={new Date().toISOString().split('T')[0]}
                    className="bg-slate-700/50 border-slate-600 text-slate-300"
                  />
                  <p className="text-xs text-slate-400">
                    Esta fecha define el periodo mensual de cumplimiento
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file" className="text-slate-200">
                    Archivo
                  </Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileSelect}
                    disabled={uploading}
                    className="bg-slate-700/50 border-slate-600 text-slate-300 cursor-pointer"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <p className="text-xs text-slate-400">
                    {selectedFile && `✓ ${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(2)}MB)`}
                    {!selectedFile && 'PDF, JPG, PNG máximo 50MB'}
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                disabled={uploading || !selectedFile || !selectedDocType}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                {uploading ? 'Subiendo...' : 'Subir Documento'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Documentos Subidos ({filteredDocuments.length} de {documents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredDocuments.length === 0 ? (
              <p className="text-slate-400 text-center py-8">
                {documents.length === 0 
                  ? 'Aún no has subido documentos' 
                  : 'No hay documentos en este período'}
              </p>
            ) : (
              <div className="space-y-2">
                {filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30 border border-slate-600"
                  >
                    <div className="flex-1">
                      <p className="text-white font-medium">{doc.file_name}</p>
                      <p className="text-xs text-slate-400">
                        Periodo: {getDocumentPeriodLabel(doc)}
                      </p>
                      <p className="text-xs text-slate-500">
                        Subido: {new Date(doc.uploaded_at).toLocaleDateString('es-CL')}
                      </p>
                      {doc.status === 'rejected' && doc.rejection_reason && (
                        <p className="text-xs text-red-400 mt-1">
                          Motivo del rechazo: {doc.rejection_reason}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      {getStatusBadge(doc.status)}
                      {doc.expires_at && (
                        <p className="text-xs text-slate-400 mt-1">
                          Vence: {new Date(doc.expires_at).toLocaleDateString('es-CL')}
                        </p>
                      )}
                    </div>
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
