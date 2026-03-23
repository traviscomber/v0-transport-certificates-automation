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
    admin: 'bg-red-100 text-red-800',
    mandante: 'bg-blue-100 text-blue-800',
    transportista: 'bg-green-100 text-green-800',
    conductor: 'bg-purple-100 text-purple-800',
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
        <h1 className="text-3xl font-bold text-[#18181B]">Gestión de Roles</h1>
        <p className="text-[#71717A]">Control de acceso y permisos del sistema</p>
      </div>

      {/* Matriz de roles y permisos */}
      <RoleManagement currentUserRole="admin" />

      {/* Asignación de roles a usuarios */}
      <Card className="border-[#E4E4E7]">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Usuarios y Roles</CardTitle>
            <CardDescription>Gestiona los roles asignados a cada usuario</CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#0066FF] text-white hover:bg-[#0052CC]">
                <Plus className="w-4 h-4 mr-2" />
                Asignar Rol
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Asignar Rol a Usuario</DialogTitle>
                <DialogDescription>Selecciona un usuario y asigna su rol en el sistema</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Email del usuario</label>
                  <Input 
                    type="email"
                    placeholder="usuario@example.com"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Rol</label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
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
                  className="w-full bg-[#0066FF] text-white hover:bg-[#0052CC]"
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
              <TableRow className="border-[#E4E4E7]">
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Asignado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockUsers.map((user) => (
                <TableRow key={user.id} className="border-[#E4E4E7]">
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    <Badge className={`${ROLE_COLORS[user.role]} gap-1.5`}>
                      {ROLE_ICONS[user.role]}
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-[#71717A]">{user.assignedAt}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-[#E4E4E7]"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialog content>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Eliminar rol</AlertDialogTitle>
                            <AlertDialogDescription>
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
                        className="border-[#E4E4E7] text-red-600 hover:text-red-700"
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
