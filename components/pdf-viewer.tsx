'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Loader2, Download, ZoomIn, ZoomOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PDFViewerProps {
  url: string
  filename: string
}

export function PDFViewer({ url, filename }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [scale, setScale] = useState(1)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pdfjsRef = useRef<any>(null)

  // Initialize PDF.js
  useEffect(() => {
    const initPdfJs = async () => {
      try {
        const pdfjsLib = await import('pdfjs-dist')
        // Use CDN worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
        pdfjsRef.current = pdfjsLib
      } catch (err) {
        console.error('[v0] Failed to load PDF.js:', err)
        setError('Failed to initialize PDF viewer')
        setLoading(false)
      }
    }
    initPdfJs()
  }, [])

  // Load and render PDF
  useEffect(() => {
    if (!pdfjsRef.current) return

    const loadPdf = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const proxyUrl = `/api/documents/proxy?url=${encodeURIComponent(url)}`
        
        // Add timeout to prevent infinite loops
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

        const response = await fetch(proxyUrl, { signal: controller.signal })
        clearTimeout(timeoutId)

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

        const arrayBuffer = await response.arrayBuffer()
        const pdf = await pdfjsRef.current.getDocument({ data: arrayBuffer }).promise

        setNumPages(pdf.numPages)
        
        // Render first page
        await renderPage(pdf, 1)
        setLoading(false)
      } catch (err: any) {
        console.error('[v0] PDF load error:', err)
        if (err.name === 'AbortError') {
          setError('PDF load timed out. Please try downloading instead.')
        } else {
          setError('Failed to load PDF. Please try downloading instead.')
        }
        setLoading(false)
      }
    }

    loadPdf()
  }, [url, pdfjsRef.current])

  const renderPage = async (pdf: any, pageNum: number) => {
    try {
      const canvas = canvasRef.current
      if (!canvas) return

      const page = await pdf.getPage(pageNum)
      const viewport = page.getViewport({ scale })

      canvas.width = viewport.width
      canvas.height = viewport.height

      const context = canvas.getContext('2d')
      if (!context) throw new Error('Could not get canvas context')

      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise
    } catch (err) {
      console.error('[v0] Error rendering page:', err)
    }
  }

  const handlePageChange = async (newPage: number) => {
    if (!pdfjsRef.current || !url) return
    
    try {
      setLoading(true)
      const proxyUrl = `/api/documents/proxy?url=${encodeURIComponent(url)}`
      const response = await fetch(proxyUrl)
      const arrayBuffer = await response.arrayBuffer()
      const pdf = await pdfjsRef.current.getDocument({ data: arrayBuffer }).promise
      
      await renderPage(pdf, newPage)
      setPageNumber(newPage)
      setLoading(false)
    } catch (err) {
      console.error('[v0] Error changing page:', err)
      setError('Failed to load page')
      setLoading(false)
    }
  }

  const handleZoom = (direction: 'in' | 'out') => {
    const newScale = direction === 'in' ? scale + 0.1 : Math.max(0.5, scale - 0.1)
    setScale(newScale)
    // Re-render current page with new scale
    if (pdfjsRef.current && url) {
      handlePageChange(pageNumber)
    }
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Controls */}
      <div className="flex items-center justify-between bg-slate-800 p-3 rounded-lg">
        <div className="flex items-center gap-2">
          {numPages && numPages > 1 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(Math.max(1, pageNumber - 1))}
                disabled={pageNumber <= 1 || loading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-slate-300 min-w-[100px] text-center">
                Page {pageNumber} of {numPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(Math.min(numPages, pageNumber + 1))}
                disabled={pageNumber >= numPages || loading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleZoom('out')}
            disabled={scale <= 0.5 || loading}
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-slate-300 min-w-[50px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleZoom('in')}
            disabled={scale >= 2 || loading}
            title="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-6 bg-slate-600 mx-2" />
          
          <a href={url} download={filename} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" title="Download">
              <Download className="h-4 w-4" />
            </Button>
          </a>
        </div>
      </div>

      {/* PDF Canvas */}
      <div className="w-full bg-slate-900 rounded-lg p-4 flex justify-center overflow-auto max-h-[60vh]">
        {loading && (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-96 text-red-400 text-center">
            <div>
              <p className="font-semibold mb-2">{error}</p>
              <p className="text-sm text-gray-400">Try downloading the file to view it offline.</p>
            </div>
          </div>
        )}

        {!loading && !error && (
          <canvas
            ref={canvasRef}
            className="border border-slate-700 rounded bg-white"
          />
        )}
      </div>
    </div>
  )
}
