'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BarChart3, FileText, Download, Plus, Calendar, User } from 'lucide-react'

interface Report {
  id: string
  report_type: 'compliance' | 'certificates' | 'activity' | 'custom'
  title: string
  description: string
  file_url: string
  created_at: string
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/reports')
      if (response.ok) {
        const { data } = await response.json()
        setReports(data || [])
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'compliance': return <BarChart3 className='h-5 w-5 text-blue-500' />
      case 'certificates': return <FileText className='h-5 w-5 text-green-500' />
      case 'activity': return <Calendar className='h-5 w-5 text-purple-500' />
      default: return <FileText className='h-5 w-5 text-slate-500' />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'compliance': return 'bg-blue-500/30 text-blue-200 border-blue-500/50'
      case 'certificates': return 'bg-green-500/30 text-green-200 border-green-500/50'
      case 'activity': return 'bg-purple-500/30 text-purple-200 border-purple-500/50'
      default: return 'bg-slate-500/30 text-slate-200 border-slate-500/50'
    }
  }

  return (
    <div className='min-h-screen bg-gradient-dark p-4 sm:p-6 lg:p-8'>
      <div className='space-y-8'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='space-y-2'>
            <h1 className='text-3xl font-bold text-foreground'>Reportes y Análisis</h1>
            <p className='text-muted-foreground'>Reportes de compliance, certificados y actividad</p>
          </div>
          <Button className='btn-orange'>
            <Plus className='h-4 w-4 mr-2' />
            Generar Reporte
          </Button>
        </div>

        {/* Report Types Grid */}
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card className='border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 hover:border-blue-600 transition-all cursor-pointer'>
            <CardHeader className='pb-3'>
              <BarChart3 className='w-8 h-8 text-blue-400 mb-2' />
              <CardTitle className='text-foreground'>Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-white'>0</div>
              <p className='text-xs text-muted-foreground'>Reportes generados</p>
            </CardContent>
          </Card>

          <Card className='border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 hover:border-green-600 transition-all cursor-pointer'>
            <CardHeader className='pb-3'>
              <FileText className='w-8 h-8 text-green-400 mb-2' />
              <CardTitle className='text-foreground'>Certificados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-white'>0</div>
              <p className='text-xs text-muted-foreground'>Reportes generados</p>
            </CardContent>
          </Card>

          <Card className='border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 hover:border-purple-600 transition-all cursor-pointer'>
            <CardHeader className='pb-3'>
              <Calendar className='w-8 h-8 text-purple-400 mb-2' />
              <CardTitle className='text-foreground'>Actividad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-white'>0</div>
              <p className='text-xs text-muted-foreground'>Reportes generados</p>
            </CardContent>
          </Card>

          <Card className='border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 hover:border-orange-600 transition-all cursor-pointer'>
            <CardHeader className='pb-3'>
              <BarChart3 className='w-8 h-8 text-orange-400 mb-2' />
              <CardTitle className='text-foreground'>Custom</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-white'>0</div>
              <p className='text-xs text-muted-foreground'>Reportes generados</p>
            </CardContent>
          </Card>
        </div>

        {/* Reports List */}
        <div className='space-y-4'>
          <h2 className='text-xl font-bold text-foreground'>Reportes Generados</h2>
          {loading ? (
            <Card className='border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900'>
              <CardContent className='p-8 text-center'>
                <div className='text-muted-foreground'>Cargando reportes...</div>
              </CardContent>
            </Card>
          ) : reports.length === 0 ? (
            <Card className='border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900'>
              <CardContent className='p-8 text-center'>
                <BarChart3 className='h-12 w-12 text-slate-400 mx-auto mb-4' />
                <div className='text-foreground font-semibold'>Sin reportes</div>
                <div className='text-muted-foreground'>Genera tu primer reporte</div>
              </CardContent>
            </Card>
          ) : (
            reports.map(report => (
              <Card key={report.id} className='border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 hover:border-slate-600 transition-all'>
                <CardContent className='p-6'>
                  <div className='flex items-start gap-4'>
                    <div className='mt-1'>
                      {getReportIcon(report.report_type)}
                    </div>
                    <div className='flex-1'>
                      <div className='flex items-center gap-3 mb-2'>
                        <h3 className='font-semibold text-foreground'>{report.title}</h3>
                        <Badge className={getTypeColor(report.report_type)}>
                          {report.report_type.toUpperCase()}
                        </Badge>
                      </div>
                      <p className='text-muted-foreground text-sm mb-3'>{report.description}</p>
                      <div className='flex items-center justify-between'>
                        <div className='flex gap-2 text-xs text-muted-foreground'>
                          <span className='flex items-center gap-1'>
                            <Calendar className='h-3 w-3' />
                            {new Date(report.created_at).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                        <div className='flex gap-2'>
                          <Button variant='outline' size='sm' className='text-xs'>
                            Ver detalles
                          </Button>
                          <Button variant='outline' size='sm' className='text-xs'>
                            <Download className='h-3 w-3' />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
