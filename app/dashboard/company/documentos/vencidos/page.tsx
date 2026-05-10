export const dynamic = 'force-dynamic'

import { ArrowLeft, AlertTriangle, Zap } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExpiredDocumentsList } from "@/components/expired-documents-list"

async function getExpiredDocuments() {
  try {
    // Fetch from the vencidos API endpoint
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_VERCEL_URL ? 'https://' + process.env.NEXT_PUBLIC_VERCEL_URL : 'http://localhost:3000'}/api/company/documents/vencidos`,
      { 
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        }
      }
    )

    if (!response.ok) {
      console.error("[v0] Error fetching expired documents:", response.status)
      return { conductorDocs: [], count: 0 }
    }

    const data = await response.json()
    const documents = data.documents || []

    return {
      conductorDocs: documents,
      count: documents.length
    }
  } catch (error) {
    console.error("[v0] Error in getExpiredDocuments:", error)
    return { conductorDocs: [], count: 0 }
  }
}

export default async function VencidosPage() {
  const { conductorDocs, count } = await getExpiredDocuments()

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="border-b border-slate-800 bg-slate-950 sticky top-0 z-40">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard/company/documentos">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Volver
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                  Documentos Vencidos
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Documentos que ya han pasado su fecha de vencimiento
                </p>
              </div>
            </div>
            <Badge className="bg-red-600 text-white text-lg px-3 py-2">
              {count} documentos
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {count === 0 ? (
            <Card className="bg-slate-800/50 border-slate-700 text-center py-12">
              <CardContent>
                <div className="flex flex-col items-center gap-4">
                  <Zap className="h-12 w-12 text-green-500" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">Excelente estado</h3>
                    <p className="text-slate-400 mt-2">
                      No hay documentos vencidos. El workspace está actualizado.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Critical Alert */}
              <Card className="bg-red-900/30 border-red-700/50">
                <CardContent className="pt-4 flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-200 text-sm font-bold">
                      ACCIÓN CRÍTICA REQUERIDA
                    </p>
                    <p className="text-red-200/70 text-xs mt-1">
                      {count} documento{count > 1 ? 's' : ''} vencido{count > 1 ? 's' : ''}. 
                      Solicita renovación inmediata a los conductores.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Documents List */}
              <ExpiredDocumentsList initialDocuments={conductorDocs} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
