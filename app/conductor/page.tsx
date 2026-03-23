"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, AlertTriangle, CheckCircle, Calendar, Upload, Download, User } from "lucide-react"
import Link from "next/link"

export default function ConductorDashboard() {

  const documentos = [
    {
      id: "1",
      tipo: "Licencia A4",
      estado: "vigente",
      vencimiento: "2025-08-20",
      diasRestantes: 152,
    },
    {
      id: "2",
      tipo: "Certificado Ley 20.123",
      estado: "vigente",
      vencimiento: "2025-05-10",
      diasRestantes: 50,
    },
    {
      id: "3",
      tipo: "Primeros Auxilios",
      estado: "vencido",
      vencimiento: "2024-01-15",
      diasRestantes: -67,
    },
    {
      id: "4",
      tipo: "Examen Toxicológico",
      estado: "vigente",
      vencimiento: "2024-12-01",
      diasRestantes: 255,
    },
  ]

  const content = (
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Mi Perfil Conductor</h1>
          <p className="text-muted-foreground">Gestiona tu documentación y cumplimiento legal</p>
        </div>

        {/* Información Personal */}
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg gradient-accent flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-foreground">Juan Carlos García Rodríguez</CardTitle>
                <CardDescription className="text-muted-foreground">RUT: 12.345.678-9</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-3">
            <div>
              <label className="text-sm text-muted-foreground">Email</label>
              <div className="text-lg font-medium text-foreground">juan.garcia@email.com</div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Teléfono</label>
              <div className="text-lg font-medium text-foreground">+56 9 1234 5678</div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Transportista Asociado</label>
              <div className="text-lg font-medium text-foreground">Transportes García SPA</div>
            </div>
          </CardContent>
        </Card>

        {/* Documentos */}
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground">Mis Documentos</CardTitle>
                <CardDescription className="text-muted-foreground">Estado de cumplimiento de documentación</CardDescription>
              </div>
              <Link href="/conductor/upload">
                <Button className="btn-orange">
                  <Upload className="w-4 h-4 mr-2" />
                  Subir Documento
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {documentos.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-800/50 p-4 hover:border-slate-600 transition-all"
                >
                  <div className="flex-1">
                    <div className="font-medium text-foreground flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      {doc.tipo}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Vencimiento: {doc.vencimiento}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right text-sm">
                      {doc.estado === "vigente" && (
                        <div className="text-green-400 font-medium">
                          {doc.diasRestantes} días
                        </div>
                      )}
                      {doc.estado === "vencido" && (
                        <div className="text-red-400 font-medium">
                          Vencido hace {Math.abs(doc.diasRestantes)} días
                        </div>
                      )}
                    </div>
                    <Badge
                      className={
                        doc.estado === "vigente"
                          ? "bg-green-500/30 text-green-200 border border-green-500/50"
                          : "bg-red-500/30 text-red-200 border border-red-500/50"
                      }
                    >
                      {doc.estado === "vigente" ? "✓ Vigente" : "✗ Vencido"}
                    </Badge>
                    <Button variant="outline" size="sm" className="border-slate-600 hover:bg-slate-700">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alertas */}
        <Card className="border-red-500/30 bg-gradient-to-br from-red-500/10 to-transparent">
          <CardHeader>
            <CardTitle className="text-red-300">Alertas Importantes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-red-300">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <div>
                  <div className="font-medium">Tu certificado de Primeros Auxilios venció hace 67 días</div>
                  <div className="text-sm text-muted-foreground">Requiere renovación inmediata</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-orange-300">
                <Calendar className="h-5 w-5 flex-shrink-0" />
                <div>
                  <div className="font-medium">Tu Licencia A4 vence en 152 días</div>
                  <div className="text-sm text-muted-foreground">Renovar próximamente</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-orange-300">
                <Calendar className="h-5 w-5 flex-shrink-0" />
                <div>
                  <div className="font-medium">Tu Certificado Ley 20.123 vence en 50 días</div>
                  <div className="text-sm text-muted-foreground">Próximo a vencer</div>
                </div>
              </div>
            </div>
            <Link href="/conductor/upload">
              <Button className="w-full btn-orange">
                <Upload className="w-4 h-4 mr-2" />
                Renovar Documentación
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-green-500/30 bg-gradient-to-br from-green-500/10 to-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-300">Documentos Vigentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">3 de 4</div>
              <p className="text-xs text-muted-foreground mt-2">75% cumplimiento</p>
            </CardContent>
          </Card>

          <Card className="border-red-500/30 bg-gradient-to-br from-red-500/10 to-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-300">Documentos Vencidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-400">1</div>
              <p className="text-xs text-muted-foreground mt-2">Requiere acción</p>
            </CardContent>
          </Card>

          <Card className="border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-orange-300">Próximo Vencimiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-400">50 días</div>
              <p className="text-xs text-muted-foreground mt-2">Ley 20.123</p>
            </CardContent>
          </Card>
        </div>

        {/* Instrucciones */}
        <Card className="border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-transparent">
          <CardHeader>
            <CardTitle className="text-blue-300 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              ¿Cómo renovar tus documentos?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="space-y-3">
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/30 text-blue-300 flex items-center justify-center font-semibold text-sm border border-blue-500/50">1</span>
                <div>
                  <p className="font-medium text-foreground">Obtén el documento renovado</p>
                  <p className="text-sm text-muted-foreground">Acude al organismo correspondiente (Licencia: Municipalidad, Ley 20.123: Institución).</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/30 text-blue-300 flex items-center justify-center font-semibold text-sm border border-blue-500/50">2</span>
                <div>
                  <p className="font-medium text-foreground">Sube el documento</p>
                  <p className="text-sm text-muted-foreground">Haz clic en "Subir Documento" y selecciona tu archivo (foto o PDF).</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/30 text-blue-300 flex items-center justify-center font-semibold text-sm border border-blue-500/50">3</span>
                <div>
                  <p className="font-medium text-foreground">Espera la validación automática</p>
                  <p className="text-sm text-muted-foreground">Nuestro sistema de IA procesa el documento en 2-4 horas.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/30 text-blue-300 flex items-center justify-center font-semibold text-sm border border-blue-500/50">4</span>
                <div>
                  <p className="font-medium text-foreground">Recibe confirmación</p>
                  <p className="text-sm text-muted-foreground">Te notificaremos por email cuando tu documento sea aprobado.</p>
                </div>
              </li>
            </ol>
            <Link href="/conductor/upload">
              <Button className="w-full btn-orange mt-4">
                <Upload className="w-4 h-4 mr-2" />
                Comenzar Carga
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )

  return <DashboardLayout>{content}</DashboardLayout>
}
