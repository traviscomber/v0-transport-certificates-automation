'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Edit2, Trash2, Users, AlertCircle } from 'lucide-react'

interface User {
  id: string
  email: string
  full_name: string
  role: string
  phone?: string
  is_active: boolean
  created_at: string
}

interface UserListClientProps {
  users: User[]
  isCompanyContext?: boolean
  onDelete?: (userId: string) => Promise<void>
}

export function UserListClient({ users: initialUsers, isCompanyContext = false, onDelete }: UserListClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        searchQuery === '' ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.full_name.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesRole = roleFilter === 'all' || user.role === roleFilter
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' ? user.is_active : !user.is_active)

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, searchQuery, roleFilter, statusFilter])

  const handleDelete = async (userId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) return

    setDeleting(userId)
    setMessage(null)
    
    try {
      if (onDelete) {
        await onDelete(userId)
      } else {
        const endpoint = isCompanyContext ? `/api/company/users/${userId}` : `/api/admin/users/${userId}`
        const response = await fetch(endpoint, { method: 'DELETE' })
        
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to delete user')
        }

        // Remove user from local state immediately
        setUsers(users.filter(u => u.id !== userId))
        setMessage({ type: 'success', text: 'Usuario eliminado correctamente' })
        
        // Reload page after 1.5 seconds to sync
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error al eliminar usuario'
      setMessage({ type: 'error', text: errorMsg })
      console.error('[v0] Delete error:', error)
    } finally {
      setDeleting(null)
    }
  }

  const baseUrl = isCompanyContext ? '/dashboard/company/usuarios' : '/admin/usuarios'

  return (
    <div className="space-y-6">
      {/* Message */}
      {message && (
        <Card className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <AlertCircle className={`h-5 w-5 flex-shrink-0 ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`} />
              <p className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {message.text}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Buscar por email o nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md bg-background"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="all">Todos los roles</option>
              <option value="admin">Admin</option>
              <option value="dispatcher">Dispatcher</option>
              <option value="driver">Driver</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Total de Usuarios</div>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Activos</div>
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.is_active).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Resultados</div>
            <div className="text-2xl font-bold">{filteredUsers.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* User List */}
      {filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay usuarios</h3>
            <p className="text-muted-foreground text-center">
              {searchQuery ? 'No coinciden los filtros de búsqueda' : 'Comienza agregando tu primer usuario'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map(user => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{user.full_name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="flex gap-4 mt-2">
                      {user.phone && (
                        <span className="text-xs text-muted-foreground">{user.phone}</span>
                      )}
                      <span className="text-xs font-medium capitalize">{user.role}</span>
                      <span className={`text-xs font-medium ${
                        user.is_active ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {user.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`${baseUrl}/${user.id}/editar`}>
                      <Button variant="outline" size="sm">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(user.id)}
                      disabled={deleting === user.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
