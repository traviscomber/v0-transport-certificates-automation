'use client'

import { DocuFleetLayout } from '@/components/layout/docufleet-layout'
import { MonthlyDocumentsList } from '@/components/monthly-documents-list'

export default function DocumentosPage() {
  return (
    <DocuFleetLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Documentos Mensuales</h1>
          <p className="text-gray-600 mt-1">Gestión centralizada de documentación requerida</p>
        </div>

        <MonthlyDocumentsList />
      </div>
    </DocuFleetLayout>
  )
}
