import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Truck, Users, Car, FileText, AlertTriangle, HelpCircle } from "lucide-react"
import Link from "next/link"
import { HelpBox } from "@/components/ui/help-box"
import { RiskMatrix } from "@/components/admin/risk-matrix"
import { calculateConductorRisk, calculateTransportistaRisk } from "@/lib/risk-matrix-calculator"
import { SmartAlertsDisplay } from "@/components/admin/smart-alerts-display"
import { generateSmartAlerts } from "@/lib/smart-alerts-generator"
import { CrossVerificationDisplay } from "@/components/admin/cross-verification-display"
import { verifyConductorData } from "@/lib/cross-verification"
import { ContractorPreQualification } from "@/components/admin/contractor-pre-qualification"
import { qualifyMultipleContractors } from "@/lib/contractor-pre-qualification"

export default async function AdminDashboard() {
  const supabase = await createClient()
  
  // Execute all queries with a single client instance
  const [mandantes, transportistas, vehiculos, conductores, documentos, docTypes, recentDocsResult, conductoresListResult, transportistasListResult, vehiculosListResult] = await Promise.all([
    supabase.from("mandantes").select("id", { count: "exact", head: true }),
    supabase.from("transportistas").select("id", { count: "exact", head: true }),
    supabase.from("vehiculos").select("id", { count: "exact", head: true }),
    supabase.from("conductores").select("id", { count: "exact", head: true }),
    supabase.from("uploaded_documents").select("id", { count: "exact", head: true }),
    supabase.from("document_types").select("id", { count: "exact", head: true }),
    supabase
      .from("uploaded_documents")
      .select(`id, original_filename, validation_status, created_at, document_types(name)`)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("conductores").select("id, nombres, apellido_paterno, vencimiento_licencia, is_active"),
    supabase.from("transportistas").select("id, razon_social, is_active, vehiculos(id), conductores(id)"),
    supabase.from("vehiculos").select("id, patente"),
  ])

  const stats = {
    mandantes: mandantes.count || 0,
    transportistas: transportistas.count || 0,
    vehiculos: vehiculos.count || 0,
    conductores: conductores.count || 0,
    documentos: documentos.count || 0,
    tiposDocumento: docTypes.count || 0,
  }

  const recentActivity = recentDocsResult.data || []

  // Generar alertas inteligentes
  const conductoresList = conductoresListResult.data || []
  const vehiculosList = vehiculosListResult.data || []
  const smartAlerts = generateSmartAlerts(conductoresList, vehiculosList)

  // Ejemplo de verificación cruzada (en producción, esto vendría del OCR)
  // Por ahora mostramos un ejemplo con datos ficticios
  const verificationExamples = conductoresList.slice(0, 3).map(conductor => 
    verifyConductorData(
      {
        id: conductor.id,
        nombres: conductor.nombres,
        apellido_paterno: conductor.apellido_paterno,
        rut: conductor.rut || '12.345.678-9',
      },
      {
        nombres: conductor.nombres,
        apellido_paterno: conductor.apellido_paterno,
        rut: conductor.rut || '12.345.678-9', // En producción: OCR extracted data
      }
    )
  )

  // Pre-calificación de transportistas
  const transportistasList = transportistasListResult.data || []
  const qualificationResults = qualifyMultipleContractors(
    transportistasList.map(t => ({
      id: t.id,
      razon_social: t.razon_social,
      rut: t.rut,
      conductores: t.conductores,
      vehiculos: t.vehiculos,
      documentos: [], // TODO: Fetch from documentos table
      outstandingIssues: 0, // TODO: Calculate from verification results
    }))
  )

  // Calcular matriz de riesgos para conductores
  const riskyConductores = conductoresList.map(conductor => {
    const riskData = calculateConductorRisk({
      id: conductor.id,
      nombres: conductor.nombres,
      apellido_paterno: conductor.apellido_paterno,
      vencimiento_licencia: conductor.vencimiento_licencia,
      is_active: conductor.is_active,
    })
    return {
      id: conductor.id,
      name: `${conductor.nombres} ${conductor.apellido_paterno}`,
      type: 'conductor' as const,
      href: `/admin/conductores`,
      ...riskData,
    }
  })

  const riskyTransportistas = transportistasList.map(t => {
    const riskData = calculateTransportistaRisk({
      id: t.id,
      razon_social: t.razon_social,
      is_active: t.is_active,
      vehiculos_count: t.vehiculos?.length || 0,
      conductores_count: t.conductores?.length || 0,
      documentos_vencidos_count: 0, // TODO: calcular desde BD
    })
    return {
      id: t.id,
      name: t.razon_social,
      type: 'transportista' as const,
      href: `/admin/transportistas`,
      ...riskData,
    }
  })

  const allRiskItems = [...riskyConductores, ...riskyTransportistas]

  const statCards = [
    { 
      label: "Mandantes", 
      value: stats.mandantes, 
      icon: Building2, 
      href: "/admin/mandantes",
      color: "text-[#0066FF]",
      bgColor: "bg-blue-50"
    },
    { 
      label: "Transportistas", 
      value: stats.transportistas, 
      icon: Truck, 
      href: "/admin/transportistas",
      color: "text-[#00C853]",
      bgColor: "bg-green-50"
    },
    { 
      label: "Vehículos", 
      value: stats.vehiculos, 
      icon: Car, 
      href: "/admin/vehiculos",
      color: "text-[#FF9500]",
      bgColor: "bg-orange-50"
    },
    { 
      label: "Conductores", 
      value: stats.conductores, 
      icon: Users, 
      href: "/admin/conductores",
      color: "text-[#0066FF]",
      bgColor: "bg-blue-50"
    },
    { 
      label: "Documentos Subidos", 
      value: stats.documentos, 
      icon: FileText, 
      href: "/admin/documentos",
      color: "text-[#00C853]",
      bgColor: "bg-green-50"
    },
    { 
      label: "Tipos de Documento", 
      value: stats.tiposDocumento, 
      icon: FileText, 
      href: "/walmart-ocr/compliance",
      color: "text-[#71717A]",
      bgColor: "bg-gray-50"
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-[#18181B]">Panel de Control</h1>
        <p className="text-[#71717A]">
          Resumen general del sistema de gestion documental
        </p>
      </div>

      {/* Ayuda Educativa */}
      <HelpBox
        variant="info"
        title="Bienvenido al Panel de Control"
        description="Desde aqui puedes administrar todo el sistema. Aqui te explicamos que puedes hacer:"
        tips={[
          "Los cuadros de colores muestran cuantos registros tienes (mandantes, transportistas, vehiculos, conductores). Haz clic en cualquiera para ver la lista completa.",
          "En 'Acciones Rapidas' encontraras botones para crear nuevos registros rapidamente. Solo haz clic en la accion que necesites.",
          "La seccion 'Actividad Reciente' muestra los ultimos documentos que se han procesado en el sistema.",
          "Si ves alertas en amarillo o rojo, significa que hay algo que requiere tu atencion (documentos por vencer, datos faltantes, etc.)."
        ]}
      />

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.label} href={stat.href}>
              <Card className="border-[#E4E4E7] hover:shadow-lg hover:border-[#0066FF]/20 transition-all duration-200 cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-sm font-medium text-[#71717A]">
                    {stat.label}
                  </CardTitle>
                  <div className={`rounded-lg p-2.5 ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-[#18181B]">{stat.value}</div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Matriz de Riesgos */}
      <RiskMatrix items={allRiskItems} />

      {/* Alertas Inteligentes */}
      <SmartAlertsDisplay alerts={smartAlerts} />

      {/* Verificación Cruzada */}
      <CrossVerificationDisplay results={verificationExamples} />

      {/* Pre-calificación de Contratistas */}
      <ContractorPreQualification results={qualificationResults} />

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rapidas</CardTitle>
            <CardDescription>
              Haz clic en cualquier opcion para realizar esa accion. Cada boton te llevara a un formulario simple.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Link 
              href="/admin/transportistas/nuevo"
              className="flex items-center gap-2 rounded-lg border p-3 hover:bg-accent transition-colors"
            >
              <Truck className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <span className="font-medium">Registrar nuevo transportista</span>
                <p className="text-xs text-muted-foreground">Agrega una empresa de transporte al sistema</p>
              </div>
            </Link>
            <Link 
              href="/admin/vehiculos/nuevo"
              className="flex items-center gap-2 rounded-lg border p-3 hover:bg-accent transition-colors"
            >
              <Car className="h-5 w-5 text-orange-600" />
              <div className="flex-1">
                <span className="font-medium">Agregar vehiculo</span>
                <p className="text-xs text-muted-foreground">Registra un camion, tracto o remolque nuevo</p>
              </div>
            </Link>
            <Link 
              href="/admin/conductores/nuevo"
              className="flex items-center gap-2 rounded-lg border p-3 hover:bg-accent transition-colors"
            >
              <Users className="h-5 w-5 text-purple-600" />
              <div className="flex-1">
                <span className="font-medium">Registrar conductor</span>
                <p className="text-xs text-muted-foreground">Da de alta a un nuevo chofer con su licencia</p>
              </div>
            </Link>
            <Link 
              href="/walmart-ocr"
              className="flex items-center gap-2 rounded-lg border p-3 hover:bg-accent transition-colors"
            >
              <FileText className="h-5 w-5 text-teal-600" />
              <div className="flex-1">
                <span className="font-medium">Subir documento con IA</span>
                <p className="text-xs text-muted-foreground">Sube una foto y la IA extrae los datos automaticamente</p>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Ultimos documentos procesados</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  No hay documentos procesados aun
                </p>
                <Link 
                  href="/walmart-ocr" 
                  className="mt-2 text-sm text-primary hover:underline"
                >
                  Subir primer documento
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((doc: any) => (
                  <div 
                    key={doc.id} 
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium truncate max-w-[200px]">
                          {doc.original_filename || "Documento"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {doc.document_types?.name}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      doc.validation_status === "validated" 
                        ? "bg-green-100 text-green-700"
                        : doc.validation_status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {doc.validation_status === "validated" ? "Validado" :
                       doc.validation_status === "rejected" ? "Rechazado" : "Pendiente"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {stats.transportistas === 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="flex items-center gap-4 py-4">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800">
                No hay transportistas registrados
              </p>
              <p className="text-sm text-yellow-700">
                Registra tu primera empresa transportista para comenzar a gestionar documentos.
              </p>
            </div>
            <Link 
              href="/admin/transportistas/nuevo"
              className="ml-auto rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700"
            >
              Registrar
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
