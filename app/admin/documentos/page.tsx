import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Search, ExternalLink, CheckCircle, XCircle, Clock } from "lucide-react"
import Link from "next/link"

async function getDocumentos() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("uploaded_documents")
    .select(`
      *,
      document_types(name, category, code),
      transportistas(razon_social),
      conductores(nombres, apellido_paterno),
      vehiculos(patente)
    `)
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) {
    console.error("Error fetching documentos:", error)
    return []
  }

  return data || []
}

async function getStats() {
  const supabase = await createClient()
  
  const [total, pending, validated, rejected] = await Promise.all([
    supabase.from("uploaded_documents").select("id", { count: "exact", head: true }),
    supabase.from("uploaded_documents").select("id", { count: "exact", head: true }).eq("validation_status", "pending"),
    supabase.from("uploaded_documents").select("id", { count: "exact", head: true }).eq("validation_status", "validated"),
    supabase.from("uploaded_documents").select("id", { count: "exact", head: true }).eq("validation_status", "rejected"),
  ])

  return {
    total: total.count || 0,
    pending: pending.count || 0,
    validated: validated.count || 0,
    rejected: rejected.count || 0,
  }
}

export default async function DocumentosPage() {
  const documentos = await getDocumentos()
  const stats = await getStats()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documentos</h1>
          <p className="text-muted-foreground">
            Documentos subidos y procesados por OCR
          </p>
        </div>
        <Link href="/walmart-ocr">
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            Subir Documento
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total documentos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-sm text-muted-foreground">Pendientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.validated}</div>
            <p className="text-sm text-muted-foreground">Validados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <p className="text-sm text-muted-foreground">Rechazados</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar documentos..."
                className="w-full rounded-md border bg-background pl-10 pr-4 py-2 text-sm"
              />
            </div>
            <select className="rounded-md border bg-background px-3 py-2 text-sm">
              <option value="">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="validated">Validados</option>
              <option value="rejected">Rechazados</option>
            </select>
            <Button variant="outline">Filtros</Button>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      {documentos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay documentos</h3>
            <p className="text-muted-foreground text-center mb-4">
              Sube tu primer documento para procesarlo con OCR
            </p>
            <Link href="/walmart-ocr">
              <Button>
                <FileText className="mr-2 h-4 w-4" />
                Subir Documento
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">Documento</th>
                  <th className="text-left p-4 font-medium">Tipo</th>
                  <th className="text-left p-4 font-medium">Entidad</th>
                  <th className="text-left p-4 font-medium">Confianza</th>
                  <th className="text-left p-4 font-medium">Estado</th>
                  <th className="text-left p-4 font-medium">Fecha</th>
                  <th className="text-right p-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {documentos.map((doc: any) => (
                  <tr key={doc.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium truncate max-w-[200px]">
                          {doc.original_filename || "Sin nombre"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{doc.document_types?.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {doc.document_types?.category}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 text-sm">
                      {doc.transportistas?.razon_social || 
                       doc.conductores?.nombres && `${doc.conductores.nombres} ${doc.conductores.apellido_paterno}` ||
                       doc.vehiculos?.patente ||
                       "-"}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                          <div 
                            className={`h-full ${
                              doc.confidence_score >= 0.8 ? "bg-green-500" :
                              doc.confidence_score >= 0.6 ? "bg-yellow-500" : "bg-red-500"
                            }`}
                            style={{ width: `${(doc.confidence_score || 0) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {Math.round((doc.confidence_score || 0) * 100)}%
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                        doc.validation_status === "validated" 
                          ? "bg-green-100 text-green-700"
                          : doc.validation_status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {doc.validation_status === "validated" && <CheckCircle className="h-3 w-3" />}
                        {doc.validation_status === "rejected" && <XCircle className="h-3 w-3" />}
                        {doc.validation_status === "pending" && <Clock className="h-3 w-3" />}
                        {doc.validation_status === "validated" ? "Validado" :
                         doc.validation_status === "rejected" ? "Rechazado" : "Pendiente"}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(doc.created_at).toLocaleDateString("es-CL")}
                    </td>
                    <td className="p-4 text-right">
                      {doc.file_url && (
                        <a 
                          href={doc.file_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          Ver <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
