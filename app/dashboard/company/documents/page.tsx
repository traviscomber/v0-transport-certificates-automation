'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Organization {
  id: string
  name: string
  rut: string
}

export default function DocumentsPage() {
  const router = useRouter()
  const [orgs, setOrgs] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const response = await fetch('/api/company/data?type=organizations', {
          signal: AbortSignal.timeout(5000)
        })
        if (!response.ok) throw new Error('Failed to fetch organizations')
        const data = await response.json()
        setOrgs(data.organizations || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading organizations')
      } finally {
        setLoading(false)
      }
    }
    fetchOrgs()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="text-slate-400 hover:text-slate-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-green-400" />
              <h1 className="text-3xl font-bold text-slate-100">Documentos</h1>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Gestión de documentos de empresas transportistas
            </p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Cargando documentos...</p>
          </div>
        ) : error ? (
          <div className="bg-red-950/30 border border-red-700 text-red-200 p-4 rounded-lg">
            Error: {error}
          </div>
        ) : orgs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400">No hay empresas registradas</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orgs.map(org => (
              <div
                key={org.id}
                className="bg-slate-800/40 border border-slate-700 rounded-lg p-4 hover:bg-slate-800/60 transition cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-100 truncate">
                      {org.name}
                    </p>
                    <p className="text-slate-400 text-sm">RUT: {org.rut}</p>
                    <div className="mt-3 pt-3 border-t border-slate-600">
                      <p className="text-xs text-slate-400">
                        Documentos requeridos:
                      </p>
                      <ul className="text-xs text-slate-400 mt-1 space-y-1">
                        <li>• Licencias de conducir</li>
                        <li>• Certificados de seguro</li>
                        <li>• Revisión técnica</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
