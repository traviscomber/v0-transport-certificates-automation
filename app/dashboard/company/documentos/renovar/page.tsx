export const dynamic = 'force-dynamic'

import { ArrowLeft, Calendar, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RenewalDocumentsList } from "@/components/renewal-documents-list"

async function getRenewalDocuments() {
  try {
    // Fetch from the renovar API endpoint
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_VERCEL_URL ? 'https://' + process.env.NEXT_PUBLIC_VERCEL_URL : 'http://localhost:3000'}/api/company/documents/renovar`,
      { 
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        }
      }
    )

    if (!response.ok) {
      console.error("[v0] Error fetching renewal documents:", response.status)
      return { conductorDocs: [], count: 0 }
    }

    const data = await response.json()
    const documents = data.documents || []

    return {
      conductorDocs: documents,
      count: documents.length
    }
  } catch (error) {
    console.error("[v0] Error in getRenewalDocuments:", error)
    return { conductorDocs: [], count: 0 }
  }
}

export default async function RenovarPage() {
  const { conductorDocs, count } = await getRenewalDocuments()

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
                  <Calendar className="h-6 w-6 text-yellow-500" />
                  Próximos a Vencer
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Documentos que vencen en los próximos 7-30 días
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-2">
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
                  <Calendar className="h-12 w-12 text-slate-500" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">Sin documentos por renovar</h3>
                    <p className="text-slate-400 mt-2">
                      Todos los documentos están vigentes o se vencerán después de 30 días
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Info Alert */}
              <Card className="bg-yellow-900/20 border-yellow-700/50">
                <CardContent className="pt-4 flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-200 text-sm font-medium">
                      Acción preventiva: Solicita renovación a los conductores ahora
                    </p>
                    <p className="text-yellow-200/70 text-xs mt-1">
                      Esto evita que los documentos se venzan. Los conductores tendrán tiempo para renovar.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Documents List */}
              <RenewalDocumentsList initialDocuments={conductorDocs} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
