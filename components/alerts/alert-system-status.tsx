'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertCircle, Clock } from 'lucide-react'

export function AlertSystemStatus() {
  const integrations = [
    {
      name: 'Document Upload (Drivers)',
      module: 'Documentos',
      endpoint: '/api/company/documents/drivers/upload',
      status: 'integrated' as const,
      triggers: ['document_uploaded'],
    },
    {
      name: 'Document Status Changes',
      module: 'Documentos',
      endpoint: '/api/company/documents/[id]/status',
      status: 'integrated' as const,
      triggers: ['document_approved', 'document_rejected', 'document_expired'],
    },
    {
      name: 'Document Upload (Subcontractors)',
      module: 'Subcontratistas',
      endpoint: '/api/company/documents/subcontractors/upload',
      status: 'pending' as const,
      triggers: ['subcontractor_document_uploaded'],
    },
    {
      name: 'Document Deletion',
      module: 'Documentos',
      endpoint: '/api/company/documents/[id]/delete',
      status: 'pending' as const,
      triggers: ['document_deleted'],
    },
    {
      name: 'User Management',
      module: 'Usuarios',
      endpoint: '/api/company/users/[id]',
      status: 'pending' as const,
      triggers: ['user_added', 'user_removed'],
    },
  ]

  const stats = {
    total: integrations.length,
    integrated: integrations.filter((i) => i.status === 'integrated').length,
    pending: integrations.filter((i) => i.status === 'pending').length,
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Endpoints</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </Card>
        <Card className="p-4 border-green-200 bg-green-50">
          <div className="text-sm text-green-700">Integrated</div>
          <div className="text-2xl font-bold text-green-700">{stats.integrated}</div>
        </Card>
        <Card className="p-4 border-yellow-200 bg-yellow-50">
          <div className="text-sm text-yellow-700">Pending</div>
          <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
        </Card>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Alert Trigger Integration Status</h3>
        <div className="space-y-2">
          {integrations.map((integration) => (
            <div key={integration.endpoint} className="flex items-start justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="font-medium text-sm">{integration.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{integration.endpoint}</div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {integration.triggers.map((trigger) => (
                    <Badge key={trigger} variant="outline" className="text-xs">
                      {trigger}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="ml-4">
                {integration.status === 'integrated' ? (
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-xs font-medium">Integrated</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-yellow-700">
                    <Clock className="w-5 h-5" />
                    <span className="text-xs font-medium">Pending</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex gap-2">
          <AlertCircle className="w-5 h-5 text-blue-700 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <div className="font-medium">Next Steps</div>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Integrate document upload (subcontractors)</li>
              <li>Integrate document deletion alerts</li>
              <li>Integrate user management alerts</li>
              <li>Set up persistent alert storage in database</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
