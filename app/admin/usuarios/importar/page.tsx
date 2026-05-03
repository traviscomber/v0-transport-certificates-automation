import { BulkImportForm } from '@/components/admin/bulk-import-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ImportarUsuariosPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/admin/usuarios"
          className="inline-flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-foreground">Importación Masiva de Usuarios</h1>
        <p className="text-muted-foreground mt-2">
          Carga múltiples usuarios de una vez desde la Gestión de Equipo
        </p>
      </div>

      <BulkImportForm />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Instrucciones</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-3 text-muted-foreground">
          <div>
            <p className="font-medium text-foreground mb-1">1. Prepara los datos</p>
            <p>Copia el nombre, email, teléfono y RUT de cada miembro del equipo</p>
          </div>
          <div>
            <p className="font-medium text-foreground mb-1">2. Ingresa en el formato correcto</p>
            <p>
              Cada línea: <code className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded text-xs">
                Nombre | email@ejemplo.com | +569123456789 | 12345678-9
              </code>
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground mb-1">3. Valida y carga</p>
            <p>Haz clic en "Validar Datos" y luego "Importar"</p>
          </div>
          <div>
            <p className="font-medium text-foreground mb-1">Rol asignado</p>
            <p>Todos se crearán como "admin_company" por defecto</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
