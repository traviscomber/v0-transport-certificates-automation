'use client'

import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PDFViewerProps {
  url: string
  filename: string
}

export function PDFViewer({ url, filename }: PDFViewerProps) {
  // Proxy the PDF through our API to avoid CORS/sandbox issues
  const proxyUrl = `/api/documents/proxy?url=${encodeURIComponent(url)}`

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Controls */}
      <div className="flex items-center justify-end bg-muted p-3 rounded-lg">
        <a href={proxyUrl} download={filename} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Descargar
          </Button>
        </a>
      </div>

      {/* PDF via iframe through same-origin proxy - no sandbox, no CORS issues */}
      <div className="w-full bg-muted rounded-lg overflow-hidden" style={{ height: '60vh' }}>
        <iframe
          src={proxyUrl}
          className="w-full h-full border-0"
          title={`Vista previa: ${filename}`}
        />
      </div>
    </div>
  )
}
