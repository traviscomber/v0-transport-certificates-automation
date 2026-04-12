'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Users, Plus, Trash2, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Driver {
  id: string
  organization_id: string
  rut: string
  email?: string
  phone?: string
  first_name: string
  last_name: string
}

export default function DriversPage() {
  const router = useRouter()
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [organizations, setOrganizations] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Driver>>({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [newDriver, setNewDriver] = useState<Partial<Driver>>({})

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [driversRes, orgsRes] = await Promise.all([
        fetch('/api/drivers'),
        fetch('/api/organizations')
      ])

      if (!driversRes.ok || !orgsRes.ok) throw new Error('Failed to fetch')

      const driversData = await driversRes.json()
      const orgsData = await orgsRes.json()

      setDrivers(driversData.drivers || [])
      
      const orgMap: Record<string, string> = {}
      if (orgsData.organizations) {
        orgsData.organizations.forEach((org: any) => {
          orgMap[org.id] = org.name
        })
      }
      setOrganizations(orgMap)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar conductor?')) return
    try {
      const res = await fetch(`/api/drivers?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      setDrivers(drivers.filter(d => d.id !== id))
    } catch {
      alert('Error')
    }
  }

  const handleSaveEdit = async (id: string) => {
    try {
      const res = await fetch('/api/drivers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...editData })
      })
      if (!res.ok) throw new Error('Failed')
      const updated = await res.json()
      setDrivers(drivers.map(d => d.id === id ? updated : d))
      setEditingId(null)
    } catch {
      alert('Error')
    }
  }

  const handleAddDriver = async () => {
    if (!newDriver.organization_id || !newDriver.first_name || !newDriver.rut) {
      alert('Complete campos requeridos')
      return
    }
    try {
      const res = await fetch('/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDriver)
      })
      if (!res.ok) throw new Error('Failed')
      const created = await res.json()
      setDrivers([created, ...drivers])
      setNewDriver({})
      setShowAddForm(false)
    } catch {
      alert('Error')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-slate-400">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-400" />
                <h1 className="text-3xl font-bold text-slate-100">Conductores</h1>
              </div>
              <p className="text-slate-400 text-sm">Total: {drivers.length}</p>
            </div>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-green-600">
            <Plus className="w-4 h-4 mr-2" />
            Agregar
          </Button>
        </div>

        {showAddForm && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <select value={newDriver.organization_id || ''} onChange={(e) => setNewDriver({...newDriver, organization_id: e.target.value})} className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm">
                <option>Empresa</option>
                {Object.entries(organizations).map(([id, name]) => (<option key={id} value={id}>{name}</option>))}
              </select>
              <input type="text" placeholder="Nombre" value={newDriver.first_name || ''} onChange={(e) => setNewDriver({...newDriver, first_name: e.target.value})} className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm" />
              <input type="text" placeholder="Apellido" value={newDriver.last_name || ''} onChange={(e) => setNewDriver({...newDriver, last_name: e.target.value})} className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm" />
              <input type="text" placeholder="RUT" value={newDriver.rut || ''} onChange={(e) => setNewDriver({...newDriver, rut: e.target.value})} className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm" />
              <input type="email" placeholder="Email" value={newDriver.email || ''} onChange={(e) => setNewDriver({...newDriver, email: e.target.value})} className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm" />
              <input type="tel" placeholder="Teléfono" value={newDriver.phone || ''} onChange={(e) => setNewDriver({...newDriver, phone: e.target.value})} className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm" />
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleAddDriver} className="bg-blue-600">Guardar</Button>
              <Button onClick={() => {setShowAddForm(false); setNewDriver({});}} variant="outline" className="border-slate-600">Cancelar</Button>
            </div>
          </div>
        )}

        {loading ? <p className="text-slate-400">Cargando...</p> : error ? <div className="text-red-400">{error}</div> : drivers.length === 0 ? <p className="text-slate-400">Sin conductores</p> : (
          <div className="bg-slate-800/40 border border-slate-700 rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/50">
                  <th className="px-4 py-2 text-left text-slate-300">Nombre</th>
                  <th className="px-4 py-2 text-left text-slate-300">RUT</th>
                  <th className="px-4 py-2 text-left text-slate-300">Email</th>
                  <th className="px-4 py-2 text-left text-slate-300">Teléfono</th>
                  <th className="px-4 py-2 text-left text-slate-300">Empresa</th>
                  <th className="px-4 py-2 text-left text-slate-300">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((driver) => (
                  <tr key={driver.id} className="border-b border-slate-700 hover:bg-slate-800/40">
                    {editingId === driver.id ? (
                      <>
                        <td className="px-4 py-2"><input type="text" value={editData.first_name || ''} onChange={(e) => setEditData({...editData, first_name: e.target.value})} className="px-2 py-1 bg-slate-700 rounded text-white text-xs w-full" /></td>
                        <td className="px-4 py-2"><input type="text" value={editData.rut || ''} onChange={(e) => setEditData({...editData, rut: e.target.value})} className="px-2 py-1 bg-slate-700 rounded text-white text-xs w-full" /></td>
                        <td className="px-4 py-2"><input type="email" value={editData.email || ''} onChange={(e) => setEditData({...editData, email: e.target.value})} className="px-2 py-1 bg-slate-700 rounded text-white text-xs w-full" /></td>
                        <td className="px-4 py-2"><input type="tel" value={editData.phone || ''} onChange={(e) => setEditData({...editData, phone: e.target.value})} className="px-2 py-1 bg-slate-700 rounded text-white text-xs w-full" /></td>
                        <td className="px-4 py-2 text-slate-300 text-xs">{organizations[driver.organization_id]}</td>
                        <td className="px-4 py-2"><Button size="sm" onClick={() => handleSaveEdit(driver.id)} className="bg-blue-600 mr-1">Guardar</Button><Button size="sm" onClick={() => setEditingId(null)} variant="outline">Cancelar</Button></td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-2 text-slate-100 text-sm">{driver.first_name} {driver.last_name}</td>
                        <td className="px-4 py-2 text-slate-400 font-mono text-xs">{driver.rut}</td>
                        <td className="px-4 py-2 text-slate-400 text-xs">{driver.email || '-'}</td>
                        <td className="px-4 py-2 text-slate-400 text-xs">{driver.phone || '-'}</td>
                        <td className="px-4 py-2 text-slate-300 text-xs">{organizations[driver.organization_id]}</td>
                        <td className="px-4 py-2"><Button size="sm" variant="outline" onClick={() => {setEditingId(driver.id); setEditData({...driver});}} className="mr-1"><Edit2 className="w-3 h-3" /></Button><Button size="sm" variant="outline" onClick={() => handleDelete(driver.id)} className="text-red-400"><Trash2 className="w-3 h-3" /></Button></td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
