'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit2, Trash2, Eye, LogOut, CheckCircle, X } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface ExecutiveUser {
  id: string
  email: string
  full_name: string
  is_active: boolean
  created_at: string
  last_sign_in: string | null
  last_activity: string | null
}

interface AuditLog {
  id: string
  user_id: string
  action: string
  resource_type: string
  resource_id: string | null
  timestamp: string
  ip_address: string | null
  user_agent: string | null
}

export default function EjecutivasManagementPage() {
  const [executives, setExecutives] = useState<ExecutiveUser[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewUserDialog, setShowNewUserDialog] = useState(false)
  const [showAuditDialog, setShowAuditDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<ExecutiveUser | null>(null)
  const [newUserData, setNewUserData] = useState({
    email: '',
    full_name: '',
    password: ''
  })

  // Load executives
  useEffect(() => {
    loadExecutives()
  }, [])

  const loadExecutives = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/executives')
      if (response.ok) {
        const data = await response.json()
        setExecutives(data || [])
      }
    } catch (error) {
      console.error('Error loading executives:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAuditLogs = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/audit-logs?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setAuditLogs(data || [])
      }
    } catch (error) {
      console.error('Error loading audit logs:', error)
    }
  }

  const handleCreateExecutive = async () => {
    try {
      const response = await fetch('/api/admin/executives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserData)
      })

      if (response.ok) {
        setNewUserData({ email: '', full_name: '', password: '' })
        setShowNewUserDialog(false)
        await loadExecutives()
      } else {
        const error = await response.json()
        alert('Error: ' + error.message)
      }
    } catch (error) {
      alert('Error creating executive: ' + (error instanceof Error ? error.message : 'Unknown'))
    }
  }

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/executives/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive })
      })

      if (response.ok) {
        await loadExecutives()
      }
    } catch (error) {
      console.error('Error toggling executive status:', error)
    }
  }

  const handleDeleteExecutive = async (userId: string, email: string) => {
    if (!confirm(`¿Estás seguro que deseas eliminar a ${email}?`)) return

    try {
      const response = await fetch(`/api/admin/executives/${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadExecutives()
      }
    } catch (error) {
      console.error('Error deleting executive:', error)
    }
  }

  const handleViewAudit = (user: ExecutiveUser) => {
    setSelectedUser(user)
    loadAuditLogs(user.id)
    setShowAuditDialog(true)
  }

  const filtered = executives.filter(ex =>
    ex.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Ejecutivas</h1>
          <p className="text-muted-foreground">Administra ejecutivas y auditoría de acciones</p>
        </div>
        <Dialog open={showNewUserDialog} onOpenChange={setShowNewUserDialog}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Ejecutiva
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nueva Ejecutiva</DialogTitle>
              <DialogDescription>Ingresa los datos de la nueva ejecutiva</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <Input
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                  placeholder="ejecutiva@labbe.cl"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Nombre</label>
                <Input
                  value={newUserData.full_name}
                  onChange={(e) => setNewUserData({...newUserData, full_name: e.target.value})}
                  placeholder="Nombre Apellido"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Contraseña Temporal</label>
                <Input
                  type="password"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
                  placeholder="Contraseña temporal"
                />
              </div>
              <Button onClick={handleCreateExecutive} className="w-full bg-teal-600">
                Crear Ejecutiva
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <Input
          placeholder="Buscar por email o nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
      </div>

      {/* Executives List */}
      <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
        <CardHeader>
          <CardTitle>Ejecutivas Registradas ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No hay ejecutivas registradas</div>
          ) : (
            <div className="space-y-2">
              {filtered.map(exec => (
                <div key={exec.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-700/50 hover:border-slate-600 transition">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground">{exec.full_name}</div>
                    <div className="text-sm text-muted-foreground">{exec.email}</div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      {exec.last_sign_in && (
                        <span>Último acceso: {new Date(exec.last_sign_in).toLocaleDateString('es-CL')}</span>
                      )}
                      {exec.last_activity && (
                        <span>Última actividad: {new Date(exec.last_activity).toLocaleDateString('es-CL')}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge className={exec.is_active ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}>
                      {exec.is_active ? 'Activa' : 'Inactiva'}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleViewAudit(exec)}
                      title="Ver auditoría"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggleActive(exec.id, exec.is_active)}
                      title={exec.is_active ? 'Desactivar' : 'Activar'}
                    >
                      {exec.is_active ? (
                        <LogOut className="w-4 h-4 text-yellow-500" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteExecutive(exec.id, exec.email)}
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audit Dialog */}
      <Dialog open={showAuditDialog} onOpenChange={setShowAuditDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Auditoría de {selectedUser?.full_name}</DialogTitle>
            <DialogDescription>Historial de acciones de esta ejecutiva</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {auditLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Sin auditoría registrada</div>
            ) : (
              auditLogs.map(log => (
                <div key={log.id} className="p-3 bg-slate-700/20 rounded border border-slate-700/50 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{log.action}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString('es-CL')}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {log.resource_type} {log.resource_id && `(ID: ${log.resource_id})`}
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
