export const dynamic = 'force-dynamic'

import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Users, Truck, ArrowLeft, FileText, ExternalLink } from "lucide-react"
import Link from "next/link"

async function getPendingDocuments() {
  const supabase = await createClient()
  
  // Get pending conductor documents
  const { data: conductorDocs, error: conductorError } = await supabase
    .from("uploaded_documents")
    .select(`
      id,
      original_filename,
      document_type_id,
      validation_status,
      file_url,
      created_at,
      conductores (
        id,
        nombres,
        apellido_paterno,
        rut
      )
    `)
    .or('validation_status.eq.pending,validation_status.is.null')
    .order("created_at", { ascending: false })
    .limit(100)
  
  if (conductorError) {
    console.error("[v0] Error fetching pending conductor docs:", conductorError)
  }

  // Get pending subcontractor documents
  const { data: subDocs, error: subError } = await supabase
    .from("subcontractor_documents")
    .select(`
      id,
      document_name,
      document_type,
      status,
      file_url,
      created_at,
      transportistas (
        id,
        razon_social,
        rut
      )
    `)
    .or('status.eq.pendiente,status.is.null')
    .order("created_at", { ascending: false })
    .limit(100)
  
  if (subError) {
    console.error("[v0] Error fetching pending sub docs:", subError)
  }

  return {
    conductorDocs: conductorDocs || [],
    subDocs: subDocs || []
  }
}

export default async function PendientesPage() {
  const { conductorDocs, subDocs } = await getPendingDocuments()
  const totalPendientes = conductorDocs.length + subDocs.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/company/documentos">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Clock className="h-6 w-6 text-amber-500" />
              Documentos Pendientes
            </h1>
            <p className="text-muted-foreground">
              {totalPendientes} documentos esperando revision
            </p>
          </div>
        </div>
      </div>

      {/* Conductor Documents Section */}
      <Card className="border-blue-500/30 bg-blue-500/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <CardTitle>Documentos de Conductores</CardTitle>
            </div>
            <Badge variant="secondary">{conductorDocs.length} pendientes</Badge>
          </div>
          <CardDescription>Licencias, antecedentes y documentos personales</CardDescription>
        </CardHeader>
        <CardContent>
          {conductorDocs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay documentos de conductores pendientes
            </p>
          ) : (
            <div className="space-y-2">
              {conductorDocs.slice(0, 10).map((doc: any) => (
                <div 
                  key={doc.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-blue-400" />
                    <div>
                      <p className="font-medium text-sm">{doc.original_filename}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.conductores?.nombres} {doc.conductores?.apellido_paterno} - {doc.conductores?.rut}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-amber-500/20 text-amber-400 text-xs">Pendiente</Badge>
                    <Link href={`/dashboard/company/conductores?rut=${doc.conductores?.rut?.replace(/\./g, '')}`}>
                      <Button variant="outline" size="sm" className="text-xs gap-1">
                        Revisar
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
              {conductorDocs.length > 10 && (
                <Link href="/dashboard/company/conductores">
                  <Button variant="link" className="w-full">
                    Ver todos los {conductorDocs.length} documentos pendientes
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subcontractor Documents Section */}
      <Card className="border-orange-500/30 bg-orange-500/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-orange-500" />
              <CardTitle>Documentos de Subcontratistas</CardTitle>
            </div>
            <Badge variant="secondary">{subDocs.length} pendientes</Badge>
          </div>
          <CardDescription>F30, F30-1, contratos y documentos legales</CardDescription>
        </CardHeader>
        <CardContent>
          {subDocs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay documentos de subcontratistas pendientes
            </p>
          ) : (
            <div className="space-y-2">
              {subDocs.slice(0, 10).map((doc: any) => (
                <div 
                  key={doc.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-orange-400" />
                    <div>
                      <p className="font-medium text-sm">{doc.document_name || doc.document_type}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.transportistas?.razon_social} - {doc.transportistas?.rut}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-amber-500/20 text-amber-400 text-xs">Pendiente</Badge>
                    <Link href="/dashboard/company/subcontratistas">
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
              {subDocs.length > 10 && (
                <Link href="/dashboard/company/subcontratistas">
                  <Button variant="link" className="w-full">
                    Ver todos los {subDocs.length} documentos pendientes
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
