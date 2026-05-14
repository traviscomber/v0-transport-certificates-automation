'use client'

import { Download, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PDFViewerProps {
  url: string
  filename: string
}

export function PDFViewer({ url, filename }: PDFViewerProps) {
  // Use proxy for CORS bypass
  const proxyUrl = `/api/documents/proxy?url=${encodeURIComponent(url)}`

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Controls */}
      <div className="flex items-center justify-between bg-slate-800 p-3 rounded-lg">
        <span className="text-sm text-slate-300 truncate max-w-[200px]">{filename}</span>
        <div className="flex gap-2">
          <a href={proxyUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="gap-2" title="Open in new tab">
              <ExternalLink className="h-4 w-4" />
              Abrir
            </Button>
          </a>
          <a href={proxyUrl} download={filename}>
            <Button variant="outline" size="sm" className="gap-2" title="Download">
              <Download className="h-4 w-4" />
              Descargar
            </Button>
          </a>
        </div>
      </div>

      {/* PDF Embed with object tag */}
      <div className="w-full bg-slate-900 rounded-lg overflow-hidden" style={{ height: '60vh' }}>
        <object
          data={proxyUrl}
          type="application/pdf"
          className="w-full h-full"
        >
          {/* Fallback for browsers that can't display PDF inline */}
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
            <p>No se puede mostrar el PDF en el navegador.</p>
            <a href={proxyUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="default" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Abrir PDF en nueva pestaña
              </Button>
            </a>
          </div>
        </object>
      </div>
    </div>
  )
}
