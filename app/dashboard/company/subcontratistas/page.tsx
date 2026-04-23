'use client'

import { SubcontractorsList } from '@/components/subcontractors-list'
import { HelpBox } from '@/components/ui/help-box'

export default function SubcontratistasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Subcontratistas</h1>
        <p className="text-muted-foreground">
          Administra y visualiza los subcontratistas asociados a LABBE
        </p>
      </div>

      <HelpBox
        variant="info"
        title="Gestión de Subcontratistas"
        description="Accede a la información detallada de los subcontratistas. Puedes buscar por nombre, RUT, ejecutiva asignada, región o comuna."
        tips={[
          "Filtra por ejecutiva para ver los subcontratistas asignados a cada una",
          "Busca por región para gestionar operaciones geográficas",
          "Usa la búsqueda por RUT para encontrar rápidamente un subcontratista",
          "Los subcontratistas cuentan con información de contacto y direcciones",
        ]}
      />

      <SubcontractorsList />
    </div>
  )
}
