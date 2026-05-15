'use client'

import { Download, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface PDFViewerProps {
  url: string
  filename: string
}

export function PDFViewer({ url, filename }: PDFViewerProps) {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return (
      <div className="flex flex-col gap-4 w-full">
        <div className="flex items-center justify-end bg-slate-800 p-3 rounded-lg">
          <a href={url} download={filename}>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Descargar PDF
            </Button>
          </a>
        </div>
        <div className="w-full bg-slate-900 rounded-lg overflow-hidden p-6 flex items-center justify-center gap-3 min-h-[60vh]">
          <AlertCircle className="h-6 w-6 text-orange-400 flex-shrink-0" />
          <div>
            <p className="text-orange-300 font-medium">Vista previa no disponible</p>
            <p className="text-sm text-slate-400 mt-1">
              <a href={url} download={filename} className="text-blue-400 hover:underline">
                Descargar documento aquí
              </a>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Controls */}
      <div className="flex items-center justify-end bg-slate-800 p-3 rounded-lg">
        <a href={url} download={filename}>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Descargar PDF
          </Button>
        </a>
      </div>

      {/* PDF Embed - direct Supabase public URL */}
      <div className="w-full bg-slate-900 rounded-lg overflow-hidden" style={{ height: '60vh' }}>
        <embed
          src={url}
          type="application/pdf"
          width="100%"
          height="100%"
          onError={() => {
            console.error('[v0] PDF embed failed:', url)
            setHasError(true)
          }}
          onLoad={() => {
            console.log('[v0] PDF loaded successfully')
          }}
        />
      </div>
    </div>
  )
}
