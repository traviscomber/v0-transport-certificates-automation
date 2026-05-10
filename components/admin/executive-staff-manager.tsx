'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Phone, Mail, FileText, Plus, Trash2, Edit } from 'lucide-react'

interface Executive {
  id: string
  nombre_completo: string
  rut: string
  cargo: string
  telefono: string
  email?: string
  transportista_id: string
  is_active: boolean
  created_at: string
}

export function ExecutiveStaffManager() {
  const [executives, setExecutives] = useState<Executive[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    nombre_completo: '',
    rut: '',
    cargo: '',
    telefono: '',
    email: ''
  })

  useEffect(() => {
    fetchExecutives()
  }, [])

  const fetchExecutives = async () => {
    try {
      const response = await fetch('/api/admin/executive-staff', {
        credentials: 'include', // ✅ Send cookies with request
      })
      const data = await response.json()
      setExecutives(data.executives || [])
    } catch (error) {
      console.error('[v0] Error fetching executives:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddExecutive = async () => {
    try {
      const response = await fetch('/api/admin/executive-staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // ✅ Send cookies with request
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setFormData({
          nombre_completo: '',
          rut: '',
          cargo: '',
          telefono: '',
          email: ''
        })
        setIsOpen(false)
        fetchExecutives()
      }
    } catch (error) {
      console.error('[v0] Error adding executive:', error)
    }
  }

  const handleDeleteExecutive = async (id: string) => {
    if (!confirm('Are you sure you want to remove this executive?')) return

    try {
      await fetch(`/api/admin/executive-staff?id=${id}`, {
        method: 'DELETE',
        credentials: 'include', // ✅ Send cookies with request
      })
      fetchExecutives()
    } catch (error) {
      console.error('[v0] Error deleting executive:', error)
    }
  }

  const getRoleBadgeColor = (cargo: string) => {
    if (cargo.toLowerCase().includes('ejecutiva')) return 'bg-blue-100 text-blue-800'
    if (cargo.toLowerCase().includes('jefe')) return 'bg-purple-100 text-purple-800'
    if (cargo.toLowerCase().includes('asistente')) return 'bg-green-100 text-green-800'
    return 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">Loading executives...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Executive Staff</CardTitle>
          <CardDescription>Manage company executives and HR personnel</CardDescription>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="default" size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Executive
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Executive</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Full Name"
                value={formData.nombre_completo}
                onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
              />
              <Input
                placeholder="RUT"
                value={formData.rut}
                onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
              />
              <Input
                placeholder="Position/Cargo"
                value={formData.cargo}
                onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
              />
              <Input
                placeholder="Phone"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              />
              <Input
                placeholder="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <Button onClick={handleAddExecutive} className="w-full">
                Add Executive
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {executives.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No executives registered yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>RUT</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {executives.map((exec) => (
                  <TableRow key={exec.id}>
                    <TableCell className="font-medium">{exec.nombre_completo}</TableCell>
                    <TableCell>{exec.rut}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(exec.cargo)}>
                        {exec.cargo}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {exec.telefono && (
                        <a href={`tel:${exec.telefono}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                          <Phone className="w-4 h-4" />
                          {exec.telefono}
                        </a>
                      )}
                    </TableCell>
                    <TableCell>
                      {exec.email && (
                        <a href={`mailto:${exec.email}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                          <Mail className="w-4 h-4" />
                          {exec.email}
                        </a>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteExecutive(exec.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
