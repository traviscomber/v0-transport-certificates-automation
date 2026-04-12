'use client'

import { DocuFleetLayout } from '@/components/layout/docufleet-layout'
import { DocumentUpload } from '@/components/document-upload'
import { DocumentValidationQueue } from '@/components/document-validation-queue'
import { MonthlyDocumentsList } from '@/components/monthly-documents-list'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'

export default function DocumentosPage() {
  // Simular detección de rol - en producción vendría del auth/contexto
  const [userRole] = useState<'conductor' | 'empresa' | 'labbé'>('conductor')
  const isLabbe = userRole === 'labbé'

  return (
    <DocuFleetLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Documentos</h1>
          <p className="text-gray-600 mt-1">
            {isLabbe
              ? 'Validar y aprobar documentos cargados por conductores y empresas'
              : 'Carga y gestiona tu documentación'}
          </p>
        </div>

        {isLabbe ? (
          <>
            {/* Vista de Labbé: Cola de validación principal */}
            <DocumentValidationQueue />

            {/* Documentos mensuales requeridos como referencia */}
            <Card>
              <CardHeader>
                <CardTitle>Documentos mensuales requeridos (referencia)</CardTitle>
              </CardHeader>
              <CardContent>
                <MonthlyDocumentsList />
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Vista de Conductor/Empresa: Subida de documentos */}
            <div className="space-y-6">
              {/* Conductor */}
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Mi Documentación como Conductor</h2>
                <DocumentUpload
                  entityType="conductor"
                  entityName="Mi Perfil de Conductor"
                />
              </div>

              {/* Empresa */}
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Documentación de la Empresa</h2>
                <DocumentUpload
                  entityType="subcontratista"
                  entityName="Mi Empresa"
                />
              </div>

              {/* Vehículos */}
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Documentación de Vehículos</h2>
                <DocumentUpload
                  entityType="vehiculo"
                  entityName="Mis Vehículos"
                />
              </div>

              {/* Referencia de documentos requeridos */}
              <Card className="bg-slate-50">
                <CardHeader>
                  <CardTitle className="text-base">Documentos mensuales requeridos</CardTitle>
                </CardHeader>
                <CardContent>
                  <MonthlyDocumentsList />
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DocuFleetLayout>
  )
}
