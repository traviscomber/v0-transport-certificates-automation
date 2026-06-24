'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { FileText, CheckCircle, Users } from 'lucide-react'

interface DocumentStats {
  totalApproved: number
  totalSubcontractors: number
  documentTypes: number
}

export default function PrevencionistaDashboard() {
  const [stats, setStats] = useState<DocumentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadStats() {
      try {
        // Get total approved documents
        const { count: approvedCount } = await supabase
          .from('subcontractor_documents')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'approved')

        // Get total subcontractors with approved documents
        const { data: subcontractors } = await supabase
          .from('subcontractor_documents')
          .select('subcontractor_id')
          .eq('status', 'approved')
          .limit(10000)

        const uniqueSubcontractors = new Set(subcontractors?.map(d => d.subcontractor_id)).size

        // Get document types with approved docs
        const { data: docTypes } = await supabase
          .from('subcontractor_document_types')
          .select('id')
          .eq('is_active', true)

        setStats({
          totalApproved: approvedCount || 0,
          totalSubcontractors: uniqueSubcontractors,
          documentTypes: docTypes?.length || 0,
        })
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [supabase])

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">
            Panel de Prevención
          </h1>
          <p className="text-slate-400">
            Acceso de solo lectura a documentos aprobados
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Documentos Aprobados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-100">
                {loading ? '-' : stats?.totalApproved}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Disponibles para revisar
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                Subcontratistas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-100">
                {loading ? '-' : stats?.totalSubcontractors}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Con documentos aprobados
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-500" />
                Tipos de Documentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-100">
                {loading ? '-' : stats?.documentTypes}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Disponibles en el sistema
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/prevencionista/documentos">
            <Card className="bg-slate-900 border-slate-700 hover:bg-slate-800 cursor-pointer transition">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-500" />
                  Ver Documentos Aprobados
                </CardTitle>
                <CardDescription>
                  Acceso de solo lectura y descarga
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-400">
                  Revisa todos los documentos aprobados con filtros por subcontratista y tipo
                </p>
              </CardContent>
            </Card>
          </Link>

          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg">Permisos</CardTitle>
              <CardDescription>
                Tu rol de prevencionista
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  Ver documentos aprobados
                </li>
                <li className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  Descargar documentos
                </li>
                <li className="flex items-center gap-2 text-red-400">
                  <span className="w-4 h-4">✗</span>
                  Crear o editar documentos
                </li>
                <li className="flex items-center gap-2 text-red-400">
                  <span className="w-4 h-4">✗</span>
                  Aprobar o rechazar documentos
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
