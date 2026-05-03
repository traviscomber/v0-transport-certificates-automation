import { ImportExecutivesForm } from '@/components/admin/import-executives-form'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Importar Ejecutivos - Labbe Admin',
  description: 'Importar ejecutivos de Transportes Labbe como usuarios del sistema',
}

export default function ImportExecutivesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/usuarios" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mb-2">
            <ChevronLeft className="h-4 w-4" />
            Volver a Usuarios
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Importar Ejecutivos</h1>
          <p className="text-muted-foreground">
            Carga automática de ejecutivos desde Transportes Labbe
          </p>
        </div>
      </div>

      <div className="grid gap-6 max-w-2xl">
        <ImportExecutivesForm />

        <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg space-y-2">
          <p className="font-medium text-sm text-blue-900 dark:text-blue-200">ℹ️ Información</p>
          <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
            <li>Los ejecutivos se cargarán automáticamente desde la tabla de equipo</li>
            <li>Se usarán los emails y teléfonos registrados en el sistema</li>
            <li>Se crearán como usuarios con rol &quot;admin_company&quot;</li>
            <li>Se enviarán emails de confirmación a cada ejecutivo</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
