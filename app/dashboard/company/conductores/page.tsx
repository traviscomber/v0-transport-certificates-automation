'use client'

import { DriversList } from '@/components/drivers-list'
import { HelpBox } from '@/components/ui/help-box'

export default function ConductoresPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Conductores</h1>
        <p className="text-muted-foreground">
          Administra y visualiza los conductores de LABBE
        </p>
      </div>

      <HelpBox
        variant="info"
        title="Gestión de Conductores"
        description="Accede a la información de los conductores operacionales. Puedes buscar, editar y gestionar datos de conductores y sus vehículos."
        tips={[
          "Busca conductores por nombre, RUT o proveedor",
          "Filtra por proveedor para ver conductores asociados",
          "Cada conductor tiene información de vehículos (patentes)",
          "Mantén actualizada la información de contacto de los conductores",
        ]}
      />

      <DriversList />
    </div>
  )
}
