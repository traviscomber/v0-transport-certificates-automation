'use client'

import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PDFViewerProps {
  url: string
  filename: string
}

export function PDFViewer({ url, filename }: PDFViewerProps) {
  // Use iframe to display PDF - simple, reliable, no infinite loops
  const proxyUrl = `/api/documents/proxy?url=${encodeURIComponent(url)}`

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Controls */}
      <div className="flex items-center justify-end bg-slate-800 p-3 rounded-lg">
        <a href={url} download={filename} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" className="gap-2" title="Download">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </a>
      </div>

      {/* PDF Iframe */}
      <div className="w-full bg-slate-900 rounded-lg overflow-hidden" style={{ height: '60vh' }}>
        <iframe
          src={proxyUrl}
          className="w-full h-full border-0"
          title="PDF Preview"
        />
      </div>
    </div>
  )
}
