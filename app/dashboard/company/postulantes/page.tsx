export const dynamic = 'force-dynamic'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function PostulantesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Postulantes</h1>
          <p className="text-muted-foreground">
            Gestión de candidatos: registro, chequeo de antecedentes, documentación y aprobación
          </p>
        </div>
        <Link href="/dashboard/company/postulantes/nuevo">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Postulante
          </Button>
        </Link>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Flujo de Onboarding de Postulantes</CardTitle>
          <CardDescription>Sistema centralizado para gestionar candidatos desde registro hasta aprobación</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex gap-3">
              <span className="text-2xl font-bold text-primary">1</span>
              <div>
                <p className="font-semibold">NUEVO: Postulante llena formulario inicial con datos básicos</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl font-bold text-primary">2</span>
              <div>
                <p className="font-semibold">CHEQUEO: Sistema verifica antecedentes en sitio externo</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl font-bold text-primary">3</span>
              <div>
                <p className="font-semibold">DOCUMENTOS: Postulante sube licencia, certificaciones, etc</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl font-bold text-primary">4</span>
              <div>
                <p className="font-semibold">APROBACIÓN: Equipo de Onboarding/Prevención de Riesgos aprueba</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl font-bold text-primary">5</span>
              <div>
                <p className="font-semibold">FINAL: Conductor registrado en sistema operacional</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      <Card>
        <CardHeader>
          <CardTitle>Sin postulantes registrados</CardTitle>
          <CardDescription>
            Comienza registrando nuevos candidatos para formar parte de tu equipo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard/company/postulantes/nuevo">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Registrar Nuevo Postulante
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
