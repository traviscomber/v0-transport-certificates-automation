'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  XCircle,
  Zap,
  Eye,
} from 'lucide-react'

const supportedTypes = [
  { name: 'Licencia de Conducir', icon: '🪪', color: 'bg-blue-500/20 text-blue-400' },
  { name: 'Permiso de Circulación', icon: '📋', color: 'bg-green-500/20 text-green-400' },
  { name: 'Revisión Técnica', icon: '🔧', color: 'bg-orange-500/20 text-orange-400' },
  { name: 'Seguro de Responsabilidad', icon: '🛡️', color: 'bg-red-500/20 text-red-400' },
  { name: 'SOAP', icon: '📄', color: 'bg-purple-500/20 text-purple-400' },
  { name: 'Título de Propiedad', icon: '🏠', color: 'bg-indigo-500/20 text-indigo-400' },
]

const recentUploads = [
  { id: 1, name: 'LicenciaJuanPerez.pdf', type: 'Licencia', status: 'processed', confidence: 98 },
  { id: 2, name: 'PermisoABC123.pdf', type: 'Permiso', status: 'processed', confidence: 95 },
  { id: 3, name: 'RT_Vehiculo_2024.pdf', type: 'Revisión', status: 'processing', confidence: null },
]

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processed':
        return <CheckCircle className="h-5 w-5 text-green-400" />
      case 'processing':
        return <Zap className="h-5 w-5 text-yellow-400" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-400" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-dark p-4 sm:p-6 lg:p-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Upload className="h-8 w-8 text-orange-400" />
            Extracción OCR de Documentos
          </h1>
          <p className="text-muted-foreground mt-2">Carga documentos y deja que la IA extraiga automáticamente los datos</p>
        </div>

        {/* Upload Area */}
        <Card 
          className={`border-2 border-dashed ${isDragging ? 'border-orange-500 bg-orange-500/10' : 'border-slate-600'} bg-gradient-to-br from-slate-800 to-slate-900 transition-all cursor-pointer`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
        >
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mb-4">
                <Upload className="h-8 w-8 text-orange-400" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Arrastra documentos aquí
              </h2>
              <p className="text-slate-400 mb-4">
                O haz clic para seleccionar archivos
              </p>
              <p className="text-xs text-slate-500 mb-4">
                Soportados: PDF, PNG, JPG, JPEG
              </p>
              <Button className="btn-orange">
                Seleccionar Archivos
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Supported Types */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Tipos de Documentos Soportados</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {supportedTypes.map((type, idx) => (
              <Card key={idx} className="border-slate-700/50 bg-slate-800/50">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${type.color}`}>
                    <span className="text-lg">{type.icon}</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">{type.name}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Uploads */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Cargas Recientes</h2>
            <Button variant="outline" size="sm">Ver todas</Button>
          </div>
          <div className="space-y-3">
            {recentUploads.map((upload) => (
              <Card key={upload.id} className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <FileText className="h-5 w-5 text-slate-400" />
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm">{upload.name}</p>
                        <p className="text-xs text-slate-500">{upload.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {upload.status === 'processing' && (
                        <div className="text-xs text-yellow-400">Procesando...</div>
                      )}
                      {upload.status === 'processed' && (
                        <div className="text-xs">
                          <Badge className="bg-green-500/30 text-green-300 border-green-500/50">
                            {upload.confidence}% confianza
                          </Badge>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        {getStatusIcon(upload.status)}
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Features */}
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
          <CardHeader>
            <CardTitle className="text-foreground">¿Cómo funciona?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500/30 flex items-center justify-center text-orange-400 font-semibold">
                1
              </div>
              <div>
                <p className="font-medium text-foreground">Carga tu documento</p>
                <p className="text-sm text-slate-400">Soportamos PDF, imágenes y escaneos de documentos</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500/30 flex items-center justify-center text-orange-400 font-semibold">
                2
              </div>
              <div>
                <p className="font-medium text-foreground">IA analiza el documento</p>
                <p className="text-sm text-slate-400">OCR avanzado extrae automáticamente todos los datos relevantes</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500/30 flex items-center justify-center text-orange-400 font-semibold">
                3
              </div>
              <div>
                <p className="font-medium text-foreground">Validación y almacenamiento</p>
                <p className="text-sm text-slate-400">Los datos se validan, guardan y están listos para usar</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
