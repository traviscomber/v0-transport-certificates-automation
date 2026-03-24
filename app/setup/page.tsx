'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertTriangle, Database, Shield, FolderOpen, Users, Loader2 } from 'lucide-react'

interface CheckResult {
  name: string
  status: 'checking' | 'ok' | 'missing' | 'error'
  message: string
}

export default function SetupPage() {
  const [checks, setChecks] = useState<CheckResult[]>([
    { name: 'profiles', status: 'checking', message: 'Verificando...' },
    { name: 'organizations', status: 'checking', message: 'Verificando...' },
    { name: 'vehicles', status: 'checking', message: 'Verificando...' },
    { name: 'drivers', status: 'checking', message: 'Verificando...' },
    { name: 'document_types', status: 'checking', message: 'Verificando...' },
    { name: 'certificates', status: 'checking', message: 'Verificando...' },
    { name: 'alerts', status: 'checking', message: 'Verificando...' },
    { name: 'reports', status: 'checking', message: 'Verificando...' },
    { name: 'audit_log', status: 'checking', message: 'Verificando...' },
    { name: 'organization_relationships', status: 'checking', message: 'Verificando...' },
    { name: 'driver_assignments', status: 'checking', message: 'Verificando...' },
  ])
  const [storageStatus, setStorageStatus] = useState<'checking' | 'ok' | 'missing' | 'error'>('checking')
  const [isRunningSetup, setIsRunningSetup] = useState(false)
  const [setupLog, setSetupLog] = useState<string[]>([])

  useEffect(() => {
    runChecks()
  }, [])

  const runChecks = async () => {
    // Check each table
    for (let i = 0; i < checks.length; i++) {
      const tableName = checks[i].name
      try {
        const res = await fetch(`/api/setup/check-table?table=${tableName}`)
        const data = await res.json()
        
        setChecks(prev => prev.map((c, idx) => 
          idx === i 
            ? { ...c, status: data.exists ? 'ok' : 'missing', message: data.message }
            : c
        ))
      } catch {
        setChecks(prev => prev.map((c, idx) => 
          idx === i 
            ? { ...c, status: 'error', message: 'Error al verificar' }
            : c
        ))
      }
    }

    // Check storage
    try {
      const res = await fetch('/api/setup/check-storage')
      const data = await res.json()
      setStorageStatus(data.exists ? 'ok' : 'missing')
    } catch {
      setStorageStatus('error')
    }
  }

  const runSetup = async () => {
    setIsRunningSetup(true)
    setSetupLog(['Iniciando setup de base de datos...'])

    try {
      const res = await fetch('/api/setup/run-migrations', { method: 'POST' })
      const data = await res.json()
      
      if (data.success) {
        setSetupLog(prev => [...prev, ...data.logs, 'Setup completado exitosamente!'])
        // Re-run checks
        await runChecks()
      } else {
        setSetupLog(prev => [...prev, `Error: ${data.error}`])
      }
    } catch (error) {
      setSetupLog(prev => [...prev, `Error: ${error}`])
    }

    setIsRunningSetup(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'missing': return <XCircle className="h-5 w-5 text-red-500" />
      case 'error': return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      default: return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ok': return <Badge className="bg-green-500/20 text-green-400 border-green-500/50">OK</Badge>
      case 'missing': return <Badge className="bg-red-500/20 text-red-400 border-red-500/50">FALTA</Badge>
      case 'error': return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">ERROR</Badge>
      default: return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">VERIFICANDO</Badge>
    }
  }

  const allOk = checks.every(c => c.status === 'ok') && storageStatus === 'ok'
  const someMissing = checks.some(c => c.status === 'missing') || storageStatus === 'missing'

  return (
    <div className="min-h-screen bg-gradient-dark p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Setup de Base de Datos</h1>
          <p className="text-muted-foreground">Verificacion y configuracion de la infraestructura</p>
        </div>

        {/* Status Summary */}
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Estado General
            </CardTitle>
          </CardHeader>
          <CardContent>
            {allOk ? (
              <div className="flex items-center gap-3 text-green-400">
                <CheckCircle className="h-8 w-8" />
                <div>
                  <div className="font-semibold text-lg">Infraestructura Completa</div>
                  <div className="text-sm text-muted-foreground">Todas las tablas y storage estan configurados correctamente</div>
                </div>
              </div>
            ) : someMissing ? (
              <div className="flex items-center gap-3 text-yellow-400">
                <AlertTriangle className="h-8 w-8" />
                <div>
                  <div className="font-semibold text-lg">Configuracion Incompleta</div>
                  <div className="text-sm text-muted-foreground">Algunas tablas o storage faltan por crear</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-blue-400">
                <Loader2 className="h-8 w-8 animate-spin" />
                <div>
                  <div className="font-semibold text-lg">Verificando...</div>
                  <div className="text-sm text-muted-foreground">Revisando estado de la base de datos</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tables Check */}
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Tablas de Base de Datos
            </CardTitle>
            <CardDescription>11 tablas requeridas para el MVP</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {checks.map((check) => (
                <div 
                  key={check.name}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-700/50 bg-slate-800/50"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(check.status)}
                    <div>
                      <div className="font-medium text-foreground">{check.name}</div>
                      <div className="text-xs text-muted-foreground">{check.message}</div>
                    </div>
                  </div>
                  {getStatusBadge(check.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Storage Check */}
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Storage de Documentos
            </CardTitle>
            <CardDescription>Bucket para almacenar archivos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-700/50 bg-slate-800/50">
              <div className="flex items-center gap-3">
                {getStatusIcon(storageStatus)}
                <div>
                  <div className="font-medium text-foreground">documents</div>
                  <div className="text-xs text-muted-foreground">Bucket para certificados y documentos</div>
                </div>
              </div>
              {getStatusBadge(storageStatus)}
            </div>
          </CardContent>
        </Card>

        {/* RLS Policies */}
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Politicas RLS (Row Level Security)
            </CardTitle>
            <CardDescription>Seguridad a nivel de filas para cada tabla</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-4">
              Las politicas RLS se crean automaticamente con las tablas y controlan quien puede leer/escribir datos.
            </div>
          </CardContent>
        </Card>

        {/* Run Setup */}
        {someMissing && (
          <Card className="border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-transparent">
            <CardHeader>
              <CardTitle className="text-orange-300">Ejecutar Migraciones</CardTitle>
              <CardDescription>Crear tablas y configurar storage faltante</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={runSetup} 
                disabled={isRunningSetup}
                className="w-full btn-orange"
              >
                {isRunningSetup ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Ejecutando Setup...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4 mr-2" />
                    Ejecutar Setup Completo
                  </>
                )}
              </Button>

              {setupLog.length > 0 && (
                <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm max-h-64 overflow-y-auto">
                  {setupLog.map((log, i) => (
                    <div key={i} className="text-slate-300">{log}</div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
          <CardHeader>
            <CardTitle>Instrucciones Manuales</CardTitle>
            <CardDescription>Si el setup automatico falla, ejecuta manualmente en Supabase</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">1. Abre Supabase Dashboard: <code className="bg-slate-700 px-2 py-1 rounded">supabase.com/dashboard</code></p>
              <p className="mb-2">2. Ve a SQL Editor</p>
              <p className="mb-2">3. Copia y ejecuta el contenido de: <code className="bg-slate-700 px-2 py-1 rounded">scripts/MVP_001_complete_schema.sql</code></p>
              <p>4. Refresca esta pagina para verificar</p>
            </div>
            <Button variant="outline" onClick={runChecks} className="w-full">
              Refrescar Verificacion
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
