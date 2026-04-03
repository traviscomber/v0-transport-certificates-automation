'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Loader2, Download, AlertCircle, CheckCircle2, Clock,
  FileText, Building2, User, Truck, Shield, Package, FileCheck,
  XCircle, Upload, TrendingUp
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface DocumentType {
  id: string
  code: string
  name: string
  category: string
  description: string
  expiration_days: number | null
  required_fields: string[]
}

interface UploadedDocument {
  id: string
  document_type_id: string
  validation_status: string
  confidence_score: number
  expiration_date: string | null
  created_at: string
}

const categoryIcons: Record<string, any> = {
  empresa: Building2,
  conductor: User,
  vehiculo: Truck,
  seguridad: Shield,
  operacional: Package,
  subcontratacion: FileCheck,
}

const categoryLabels: Record<string, string> = {
  empresa: 'Empresa',
  conductor: 'Conductor',
  vehiculo: 'Vehículo',
  seguridad: 'Seguridad',
  operacional: 'Operacional',
  subcontratacion: 'Subcontratación',
}

const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
  validated: { label: 'Validado', className: 'badge-success border-green-500/30', icon: CheckCircle2 },
  pending:   { label: 'Pendiente', className: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30', icon: Clock },
  expired:   { label: 'Vencido', className: 'bg-orange-500/20 text-orange-300 border border-orange-500/30', icon: AlertCircle },
  missing:   { label: 'Sin subir', className: 'bg-red-500/20 text-red-300 border border-red-500/30', icon: XCircle },
}

export default function ComplianceDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([])
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([])
  const [error, setError] = useState<string>('')
  const [activeCategory, setActiveCategory] = useState('all')
  const supabase = createClient()

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')
      console.log("[v0] Starting fetchData...")
      
      // Fetch document types
      const typesResponse = await supabase
        .from('document_types')
        .select('*')
        .eq('is_active', true)
        .order('category')
      
      console.log("[v0] document_types response:", typesResponse)
      
      if (typesResponse.error) {
        console.error("[v0] document_types error:", typesResponse.error)
        throw new Error(`Document types error: ${typesResponse.error.message}`)
      }
      
      const types = typesResponse.data || []
      console.log("[v0] Loaded", types.length, "document types")
      setDocumentTypes(types)

      // Fetch uploaded documents
      const docsResponse = await supabase
        .from('uploaded_documents')
        .select('*')
        .order('created_at', { ascending: false })
      
      console.log("[v0] uploaded_documents response:", docsResponse)
      
      if (docsResponse.error) {
        console.error("[v0] uploaded_documents error:", docsResponse.error)
        throw new Error(`Uploaded documents error: ${docsResponse.error.message}`)
      }
      
      const docs = docsResponse.data || []
      console.log("[v0] Loaded", docs.length, "uploaded documents")
      setUploadedDocs(docs)
    } catch (err) {
      console.error("[v0] Error in fetchData:", err)
      setError(err instanceof Error ? err.message : 'Error cargando datos')
    } finally {
      setLoading(false)
    }
  }

  const getDocStatus = (docTypeId: string) => {
    const uploaded = uploadedDocs.find(ud => ud.document_type_id === docTypeId)
    if (!uploaded) return 'missing'
    if (uploaded.expiration_date && new Date(uploaded.expiration_date) < new Date()) return 'expired'
    return uploaded.validation_status
  }

  const categories = ['empresa', 'conductor', 'vehiculo', 'seguridad', 'operacional', 'subcontratacion']
  const getCategoryStats = () => {
    return categories.reduce<Record<string, any>>((acc, cat) => {
      const typesIn = documentTypes.filter(dt => dt.category === cat)
      const uploadedIn = uploadedDocs.filter(ud => documentTypes.find(dt => dt.id === ud.document_type_id)?.category === cat)
      const validated = uploadedIn.filter(ud => ud.validation_status === 'validated').length
      const pending = uploadedIn.filter(ud => ud.validation_status === 'pending').length
      const expired = uploadedIn.filter(ud => ud.expiration_date && new Date(ud.expiration_date) < new Date()).length
      acc[cat] = { total: typesIn.length, validated, pending, expired, missing: typesIn.length - uploadedIn.length }
      return acc
    }, {})
  }

  const categoryStats = getCategoryStats()
  const totalTypes = documentTypes.length
  const totalValidated = uploadedDocs.filter(d => d.validation_status === 'validated').length
  const totalPending = uploadedDocs.filter(d => d.validation_status === 'pending').length
  const totalMissing = totalTypes - uploadedDocs.length
  const compliancePercent = totalTypes > 0 ? Math.round((totalValidated / totalTypes) * 100) : 0
  const filteredDocTypes = activeCategory === 'all' ? documentTypes : documentTypes.filter(dt => dt.category === activeCategory)

  const downloadReport = () => {
    const rows = documentTypes.map(dt => {
      const status = getDocStatus(dt.id)
      const uploaded = uploadedDocs.find(ud => ud.document_type_id === dt.id)
      return [dt.category, dt.name, dt.code,
        status === 'missing' ? 'No subido' : status === 'validated' ? 'Validado' : status === 'expired' ? 'Vencido' : 'Pendiente',
        uploaded ? `${Math.round(uploaded.confidence_score * 100)}%` : '-',
        uploaded?.expiration_date || '-'
      ].join(',')
    })
    const csv = ['Categoria,Documento,Codigo,Estado,Confianza,Vencimiento', ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `compliance_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">Cargando datos...</p>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full badge-primary text-xs mb-3">
            <TrendingUp className="w-3 h-3" />
            Estado Documental en Tiempo Real
          </div>
          <h1 className="text-3xl font-black text-balance">Dashboard de <span className="text-gradient">Compliance</span></h1>
          <p className="text-muted-foreground mt-1">Monitorea el estado de todos los documentos requeridos.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/ocr">
            <Button variant="outline" className="btn-orange-outline gap-2">
              <Upload className="h-4 w-4" />
              Subir Documento
            </Button>
          </Link>
          <Button onClick={downloadReport} className="btn-orange gap-2">
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <button 
              onClick={fetchData}
              className="ml-3 underline hover:no-underline text-sm font-medium"
            >
              Reintentar
            </button>
          </AlertDescription>
        </Alert>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Compliance % */}
        <Card className="lg:col-span-1 border-neon-orange">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Cumplimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-gradient">{compliancePercent}%</div>
            <div className="w-full bg-secondary rounded-full h-1.5 mt-3">
              <div className="gradient-accent h-1.5 rounded-full transition-all" style={{ width: `${compliancePercent}%` }} />
            </div>
          </CardContent>
        </Card>

        {[
          { label: 'Tipos Requeridos', value: totalTypes, sub: 'documentos', color: 'text-foreground' },
          { label: 'Validados', value: totalValidated, sub: 'aprobados', color: 'text-green-400' },
          { label: 'Pendientes', value: totalPending, sub: 'en revisión', color: 'text-yellow-400' },
          { label: 'Sin Subir', value: Math.max(0, totalMissing), sub: 'faltan', color: 'text-red-400' },
        ].map(({ label, value, sub, color }) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-black ${color}`}>{value}</div>
              <p className="text-xs text-muted-foreground mt-1">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Requirements Guide */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Documentos Requeridos - Cumplimiento Walmart Chile</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* EMPRESA */}
            <div className="p-4 rounded-lg bg-secondary/40 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-5 w-5 text-orange-400" />
                <p className="font-semibold text-foreground">Empresa (5 documentos)</p>
              </div>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• RUT Empresa</li>
                <li>• Escritura de Constitución</li>
                <li>• Certificado de Vigencia</li>
                <li>• Poder del Representante</li>
                <li>• Cédula Representante Legal</li>
              </ul>
            </div>

            {/* CONDUCTOR */}
            <div className="p-4 rounded-lg bg-secondary/40 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-5 w-5 text-cyan-400" />
                <p className="font-semibold text-foreground">Conductor (9 documentos)</p>
              </div>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Cédula de Identidad</li>
                <li>• Licencia Profesional A-4/A-5</li>
                <li>• Hoja de Vida</li>
                <li>• Certificado de Antecedentes</li>
                <li>• Inhabilidades Menores</li>
                <li>• Contrato de Trabajo</li>
                <li>• Certificado AFP</li>
                <li>• Certificado de Salud</li>
                <li>• Examen Preocupacional</li>
              </ul>
            </div>

            {/* VEHICULO */}
            <div className="p-4 rounded-lg bg-secondary/40 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="h-5 w-5 text-green-400" />
                <p className="font-semibold text-foreground">Vehículo (8 documentos)</p>
              </div>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Padrón/Inscripción Vehicular</li>
                <li>• Permiso de Circulación</li>
                <li>• Revisión Técnica</li>
                <li>• Certificado de Emisiones</li>
                <li>• Seguro SOAP</li>
                <li>• Seguro de Carga</li>
                <li>• Seguro Responsabilidad Civil</li>
                <li>• Fotografía + GPS</li>
              </ul>
            </div>

            {/* SEGURIDAD */}
            <div className="p-4 rounded-lg bg-secondary/40 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-red-400" />
                <p className="font-semibold text-foreground">Seguridad (5 documentos)</p>
              </div>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Reglamento Interno</li>
                <li>• Procedimientos Trabajo Seguro</li>
                <li>• Matriz de Riesgos</li>
                <li>• Capacitaciones</li>
                <li>• Protocolos de Accidentes</li>
              </ul>
            </div>

            {/* OPERACIONAL */}
            <div className="p-4 rounded-lg bg-secondary/40 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-5 w-5 text-violet-400" />
                <p className="font-semibold text-foreground">Operacional (5 documentos)</p>
              </div>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Guía de Despacho</li>
                <li>• Orden de Transporte</li>
                <li>• Carta de Porte</li>
                <li>• Documentos de Carga</li>
                <li>• Registro de Entrega</li>
              </ul>
            </div>

            {/* SUBCONTRATACION */}
            <div className="p-4 rounded-lg bg-secondary/40 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <FileCheck className="h-5 w-5 text-pink-400" />
                <p className="font-semibold text-foreground">Subcontratación (3 documentos)</p>
              </div>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Contratos de Subcontratación</li>
                <li>• F-30-1 Actualizado</li>
                <li>• Cumplimiento Previsional</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Category grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {categories.map(cat => {
          const st = categoryStats[cat]
          const Icon = categoryIcons[cat] || FileText
          const pct = st.total > 0 ? Math.round((st.validated / st.total) * 100) : 0
          const isActive = activeCategory === cat
          return (
            <Card
              key={cat}
              className={`cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 ${isActive ? 'border-primary shadow-lg shadow-primary/20' : 'border-border hover:border-primary/40'}`}
              onClick={() => setActiveCategory(isActive ? 'all' : cat)}
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-xs">{categoryLabels[cat]}</span>
                </div>
                <div className="text-xl font-black">{st.validated}<span className="text-muted-foreground font-normal text-sm">/{st.total}</span></div>
                <div className="w-full bg-secondary rounded-full h-1 mt-2">
                  <div
                    className={`h-1 rounded-full ${pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  {st.missing > 0 && <span className="text-xs text-red-400">{st.missing} faltan</span>}
                  {st.pending > 0 && <span className="text-xs text-yellow-400">{st.pending} pend.</span>}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Document table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {activeCategory === 'all' ? 'Todos los Documentos' : `${categoryLabels[activeCategory]} — Documentos`}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                {filteredDocTypes.length} documentos
                {activeCategory !== 'all' && (
                  <button className="text-primary text-xs hover:underline" onClick={() => setActiveCategory('all')}>Ver todos</button>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Documento</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Categoría</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estado</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Vencimiento</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredDocTypes.map((docType) => {
                  const status = getDocStatus(docType.id)
                  const cfg = statusConfig[status]
                  const StatusIcon = cfg.icon
                  return (
                    <tr key={docType.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div>
                            <div className="font-medium text-foreground">{docType.name}</div>
                            <div className="text-xs text-muted-foreground">{docType.code}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 hidden sm:table-cell">
                        <span className="badge-accent px-2 py-0.5 rounded-full text-xs capitalize">
                          {categoryLabels[docType.category] || docType.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.className}`}>
                          <StatusIcon className="h-3 w-3" />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell text-muted-foreground text-xs">
                        {docType.expiration_days ? `Cada ${docType.expiration_days} días` : 'Sin vencimiento'}
                      </td>
                      <td className="py-3 px-4">
                        {(status === 'missing' || status === 'expired') ? (
                          <Link href={`/ocr?docType=${docType.code}`}>
                            <Button size="sm" className="btn-orange h-7 text-xs gap-1 px-3">
                              <Upload className="h-3 w-3" />
                              Subir
                            </Button>
                          </Link>
                        ) : (
                          <span className="text-xs text-muted-foreground">Cargado</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
