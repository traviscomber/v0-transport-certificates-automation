'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Shield, Plus, Trash2, Edit2, Users, Building2, Truck, User } from 'lucide-react'
import { RoleManagement } from "@/components/admin/role-management"

export default function RolesPage() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState('admin')
  const [userEmail, setUserEmail] = useState('')
  const [loading, setLoading] = useState(false)

  // Mock data - En producción vendría de la BD
  const mockUsers = [
    { id: '1', email: 'admin@docufleet.com', role: 'admin', assignedAt: '2024-01-15' },
    { id: '2', email: 'mandante@docufleet.com', role: 'mandante', assignedAt: '2024-02-10' },
    { id: '3', email: 'transportista@docufleet.com', role: 'transportista', assignedAt: '2024-03-05' },
    { id: '4', email: 'conductor@docufleet.com', role: 'conductor', assignedAt: '2024-03-12' },
  ]

  const ROLE_ICONS: Record<string, React.ReactNode> = {
    admin: <Shield className="w-4 h-4" />,
    mandante: <Building2 className="w-4 h-4" />,
    transportista: <Truck className="w-4 h-4" />,
    conductor: <User className="w-4 h-4" />,
  }

  const ROLE_COLORS: Record<string, string> = {
    admin: 'bg-red-500/30 text-red-200 border border-red-500/50',
    mandante: 'bg-blue-500/30 text-blue-200 border border-blue-500/50',
    transportista: 'bg-green-500/30 text-green-200 border border-green-500/50',
    conductor: 'bg-purple-500/30 text-purple-200 border border-purple-500/50',
  }

  const handleAssignRole = async () => {
    if (!userEmail || !selectedRole) return
    setLoading(true)
    try {
      const response = await fetch('/api/admin/roles/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, role: selectedRole }),
      })
      if (response.ok) {
        setUserEmail('')
        setSelectedRole('admin')
        setIsOpen(false)
      }
    } catch (error) {
      console.error('Error assigning role:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Gestión de Roles</h1>
        <p className="text-muted-foreground">Control de acceso y permisos del sistema</p>
      </div>

      {/* Matriz de roles y permisos */}
      <RoleManagement currentUserRole="administrador" />

      {/* Asignación de roles a usuarios */}
      <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-foreground">Usuarios y Roles</CardTitle>
            <CardDescription className="text-muted-foreground">Gestiona los roles asignados a cada usuario</CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="btn-orange">
                <Plus className="w-4 h-4 mr-2" />
                Asignar Rol
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-700/50">
              <DialogHeader>
                <DialogTitle className="text-foreground">Asignar Rol a Usuario</DialogTitle>
                <DialogDescription className="text-muted-foreground">Selecciona un usuario y asigna su rol en el sistema</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block text-foreground">Email del usuario</label>
                  <Input 
                    type="email"
                    placeholder="usuario@example.com"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="bg-slate-800/50 border-slate-700 text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block text-foreground">Rol</label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="mandante">Mandante</SelectItem>
                      <SelectItem value="transportista">Transportista</SelectItem>
                      <SelectItem value="conductor">Conductor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleAssignRole}
                  disabled={loading}
                  className="w-full btn-orange font-semibold"
                >
                  {loading ? 'Asignando...' : 'Asignar Rol'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700/30 hover:bg-slate-800/50">
                <TableHead className="text-slate-300">Email</TableHead>
                <TableHead className="text-slate-300">Rol</TableHead>
                <TableHead className="text-slate-300">Asignado</TableHead>
                <TableHead className="text-right text-slate-300">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockUsers.map((user) => (
                <TableRow key={user.id} className="border-slate-700/30 hover:bg-slate-800/50">
                  <TableCell className="font-medium text-foreground">{user.email}</TableCell>
                  <TableCell>
                    <Badge className={`${ROLE_COLORS[user.role]} gap-1.5`}>
                      {ROLE_ICONS[user.role]}
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{user.assignedAt}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-slate-700 hover:bg-slate-800"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogContent className="bg-slate-900 border-slate-700/50">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-foreground">Eliminar rol</AlertDialogTitle>
                          <AlertDialogDescription className="text-muted-foreground">
                            ¿Está seguro que desea eliminar el rol {user.role} de {user.email}?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="flex justify-end gap-2">
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction>Eliminar</AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
