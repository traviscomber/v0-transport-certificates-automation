'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  X,
  Loader2,
  Download,
  Eye,
} from 'lucide-react'
import * as XLSX from 'xlsx'

interface ClientRow {
  rut: string
  razonSocial: string
  email: string
  telefono: string
  ciudad: string
  direccion: string
  contacto: string
}

interface ImportResult {
  success: number
  failed: number
  total: number
  errors: string[]
}

export function ClientsXlsImporter() {
  const [isLoading, setIsLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [previewData, setPreviewData] = useState<ClientRow[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const validateClientRow = (row: any, rowIndex: number): { valid: boolean; error?: string; data?: ClientRow } => {
    const errors: string[] = []

    if (!row.rut || typeof row.rut !== 'string') errors.push('RUT requerido')
    if (!row.razonSocial || typeof row.razonSocial !== 'string') errors.push('Razón Social requerida')
    if (!row.email || !row.email.includes('@')) errors.push('Email válido requerido')
    if (!row.telefono) errors.push('Teléfono requerido')
    if (!row.ciudad) errors.push('Ciudad requerida')

    if (errors.length > 0) {
      return {
        valid: false,
        error: `Fila ${rowIndex + 2}: ${errors.join(', ')}`,
      }
    }

    return {
      valid: true,
      data: {
        rut: String(row.rut).trim(),
        razonSocial: String(row.razonSocial).trim(),
        email: String(row.email).trim().toLowerCase(),
        telefono: String(row.telefono).trim(),
        ciudad: String(row.ciudad).trim(),
        direccion: String(row.direccion || '').trim(),
        contacto: String(row.contacto || '').trim(),
      },
    }
  }

  const processFile = async (file: File) => {
    try {
      setIsLoading(true)
      setImportResult(null)
      setPreviewData([])

      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      if (jsonData.length === 0) {
        setImportResult({
          success: 0,
          failed: 1,
          total: 0,
          errors: ['El archivo XLS está vacío'],
        })
        return
      }

      const validRows: ClientRow[] = []
      const errors: string[] = []

      jsonData.forEach((row: any, index: number) => {
        const validation = validateClientRow(row, index)
        if (validation.valid && validation.data) {
          validRows.push(validation.data)
        } else if (validation.error) {
          errors.push(validation.error)
        }
      })

      setPreviewData(validRows.slice(0, 10))

      // Aquí iría la llamada a la API para guardar en BD
      // await fetch('/api/clients/import', { method: 'POST', body: JSON.stringify(validRows) })

      setImportResult({
        success: validRows.length,
        failed: errors.length,
        total: jsonData.length,
        errors: errors.slice(0, 5), // Mostrar solo primeros 5 errores
      })

      if (errors.length > 5) {
        setImportResult(prev => prev ? { ...prev, errors: [...(prev.errors || []), `... y ${errors.length - 5} errores más`] } : null)
      }

      setShowPreview(true)
    } catch (error) {
      console.error('[v0] XLS import error:', error)
      setImportResult({
        success: 0,
        failed: 1,
        total: 0,
        errors: ['Error al procesar el archivo XLS'],
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type.includes('spreadsheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        await processFile(file)
      } else {
        setImportResult({
          success: 0,
          failed: 1,
          total: 0,
          errors: ['Solo se aceptan archivos XLS/XLSX'],
        })
      }
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files && files.length > 0) {
      await processFile(files[0])
    }
  }

  const downloadTemplate = () => {
    const template = [
      {
        rut: '12.345.678-9',
        razonSocial: 'Empresa Transportista SpA',
        email: 'contacto@empresa.com',
        telefono: '+56912345678',
        ciudad: 'Santiago',
        direccion: 'Calle Principal 123',
        contacto: 'Juan Pérez',
      },
    ]

    const ws = XLSX.utils.json_to_sheet(template)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Clientes')
    XLSX.writeFile(wb, 'plantilla-clientes.xlsx')
  }

  return (
    <div className="space-y-6">
      {/* Upload Card */}
      <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/30 to-slate-900/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-blue-400" />
            Importar Transportistas
          </CardTitle>
          <CardDescription>Carga un archivo XLS con los datos de empresas transportistas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Drag and Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative rounded-lg border-2 border-dashed p-12 text-center transition-all ${
              isDragging
                ? 'border-blue-400 bg-blue-500/10'
                : 'border-slate-600 bg-slate-800/20 hover:border-slate-500'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="flex flex-col items-center gap-4">
              {isLoading ? (
                <>
                  <Loader2 className="h-12 w-12 text-blue-400 animate-spin" />
                  <p className="text-slate-300">Procesando archivo...</p>
                </>
              ) : (
                <>
                  <Upload className="h-12 w-12 text-slate-400" />
                  <div>
                    <p className="font-medium text-white mb-1">Arrastra tu archivo XLS aquí</p>
                    <p className="text-sm text-slate-400">o haz clic para seleccionar</p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4 bg-blue-600 hover:bg-blue-700"
                  >
                    Seleccionar archivo
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Helper Text */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
            <div className="flex gap-3">
              <FileSpreadsheet className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-slate-300">
                <p className="font-medium mb-2">Formato requerido:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li>Columnas: RUT, Razón Social, Email, Teléfono, Ciudad, Dirección, Contacto</li>
                  <li>Máximo 1000 registros por importación</li>
                  <li>Formatos soportados: XLSX, XLS</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Download Template Button */}
          <Button
            variant="outline"
            onClick={downloadTemplate}
            className="w-full border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            <Download className="h-4 w-4 mr-2" />
            Descargar plantilla
          </Button>
        </CardContent>
      </Card>

      {/* Import Results */}
      {importResult && (
        <Card className={`border-slate-700/50 ${importResult.failed > 0 ? 'bg-yellow-500/5' : 'bg-green-500/5'}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {importResult.failed === 0 ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  Importación exitosa
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  Importación con errores
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-slate-800/50 p-4">
                <p className="text-sm text-slate-400 mb-1">Total</p>
                <p className="text-2xl font-bold text-white">{importResult.total}</p>
              </div>
              <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4">
                <p className="text-sm text-green-300 mb-1">Exitosos</p>
                <p className="text-2xl font-bold text-green-400">{importResult.success}</p>
              </div>
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
                <p className="text-sm text-red-300 mb-1">Errores</p>
                <p className="text-2xl font-bold text-red-400">{importResult.failed}</p>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <Alert className="border-yellow-500/30 bg-yellow-500/10">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <AlertDescription className="text-yellow-200">
                  <p className="font-medium mb-2">Errores encontrados:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {importResult.errors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {previewData.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                className="w-full border-slate-600"
              >
                <Eye className="h-4 w-4 mr-2" />
                {showPreview ? 'Ocultar' : 'Ver'} vista previa ({previewData.length} registros)
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Preview Table */}
      {showPreview && previewData.length > 0 && (
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/30 to-slate-900/30">
          <CardHeader>
            <CardTitle className="text-base">Vista previa de datos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-700/50">
                  <tr>
                    <th className="px-4 py-2 text-left text-slate-400">RUT</th>
                    <th className="px-4 py-2 text-left text-slate-400">Razón Social</th>
                    <th className="px-4 py-2 text-left text-slate-400">Email</th>
                    <th className="px-4 py-2 text-left text-slate-400">Teléfono</th>
                    <th className="px-4 py-2 text-left text-slate-400">Ciudad</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((client, idx) => (
                    <tr key={idx} className="border-b border-slate-700/30 hover:bg-slate-800/30">
                      <td className="px-4 py-3 text-white">{client.rut}</td>
                      <td className="px-4 py-3 text-slate-300">{client.razonSocial}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{client.email}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{client.telefono}</td>
                      <td className="px-4 py-3 text-slate-400">{client.ciudad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
