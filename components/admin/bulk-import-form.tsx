'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle2, Upload } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface BulkUser {
  full_name: string
  email: string
  phone: string
  rut: string
  role: 'admin_company' | 'dispatcher' | 'driver'
  is_active?: boolean
}

export function BulkImportForm() {
  const [users, setUsers] = useState<BulkUser[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [csvInput, setCsvInput] = useState('')

  const parseCSV = (text: string) => {
    const lines = text.trim().split('\n')
    const parsedUsers: BulkUser[] = []

    console.log('[v0] Parsing CSV with', lines.length, 'lines')

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) {
        console.log('[v0] Line', i, 'is empty, skipping')
        continue
      }

      // Format: nombre | email | teléfono | rut
      const parts = line.split('|').map(s => s.trim())
      console.log('[v0] Line', i, 'parts:', parts)

      const [name, email, phone, rut] = parts

      if (!name || !email || !phone || !rut) {
        console.warn('[v0] Line', i, 'missing fields. Got:', { name, email, phone, rut })
        continue
      }

      parsedUsers.push({
        full_name: name,
        email: email.toLowerCase(),
        phone,
        rut,
        role: 'admin_company',
        is_active: true,
      })
      console.log('[v0] Added user:', name, email)
    }

    console.log('[v0] Total parsed users:', parsedUsers.length)
    return parsedUsers
  }

  const handleParse = () => {
    console.log('[v0] handleParse called with input length:', csvInput.length)
    setError('')
    if (!csvInput.trim()) {
      setError('Por favor ingresa datos de usuarios')
      return
    }

    const parsed = parseCSV(csvInput)
    console.log('[v0] Parsed result:', parsed)
    if (parsed.length === 0) {
      setError('No se encontraron usuarios válidos. Formato: nombre | email | teléfono | rut')
      return
    }

    setUsers(parsed)
    setSuccess(`${parsed.length} usuarios listos para importar`)
  }

  const handleImport = async () => {
    if (users.length === 0) {
      setError('No hay usuarios para importar')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const payload = { users }
      console.log('[v0] Starting bulk import of', users.length, 'users')
      console.log('[v0] Payload:', JSON.stringify(payload))

      const response = await fetch('/api/admin/users/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      console.log('[v0] Response status:', response.status, response.statusText)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('[v0] Error response:', errorData)
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('[v0] Bulk import response:', data)

      setSuccess(
        `✓ ${data.created} usuarios creados exitosamente${data.errors?.length > 0 ? `, ${data.errors.length} errores` : ''}`
      )
      setUsers([])
      setCsvInput('')

      if (data.errors?.length > 0) {
        setError(`Errores: ${data.errors.map((e: any) => e.email + ': ' + e.error).join(', ')}`)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error en importación'
      console.error('[v0] Bulk import error:', msg)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Importar Usuarios en Masa
        </CardTitle>
        <CardDescription>
          Ingresa datos de múltiples usuarios para crearlos de una vez
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg space-y-2 text-sm">
          <p className="font-medium">Formato esperado (una línea por usuario):</p>
          <p className="font-mono text-xs text-slate-600 dark:text-slate-400 break-words">
            Nombre Completo | email@ejemplo.com | +569123456789 | 12345678-9
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Separar campos con tubería (|) · Sin encabezados
          </p>
        </div>

        <textarea
          value={csvInput}
          onChange={(e) => setCsvInput(e.target.value)}
          placeholder="Olga Lydia Carrasco Olivares | olga@ejemplo.com | 569 77664753 | 18877641-8
Carolina Pílar Sepúlveda Contreras | carolina@ejemplo.com | 569 50067666 | 15464894-8
Daniela Constanza Silva Rojas | daniela@ejemplo.com | 569 7854072 | 17782246-2"
          className="w-full h-32 p-3 border rounded-lg font-mono text-sm bg-white dark:bg-slate-950 dark:border-slate-700"
        />

        <div className="flex gap-2">
          <Button 
            onClick={() => {
              console.log('[v0] Validar Datos button clicked')
              handleParse()
            }} 
            variant="outline" 
            disabled={!csvInput.trim()}
          >
            Validar Datos
          </Button>
          <Button 
            onClick={() => {
              console.log('[v0] Importar button clicked, users.length:', users.length)
              handleImport()
            }} 
            disabled={users.length === 0 || loading} 
            className="bg-orange-600 hover:bg-orange-700"
          >
            {loading ? 'Importando...' : `Importar ${users.length} Usuarios`}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-600 bg-green-50 dark:bg-green-950">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">{success}</AlertDescription>
          </Alert>
        )}

        {users.length > 0 && (
          <div className="border rounded-lg p-3 space-y-2 bg-blue-50 dark:bg-blue-950">
            <p className="font-medium text-sm">Usuarios a importar ({users.length}):</p>
            {users.map((user, idx) => (
              <div key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex justify-between">
                <span>{user.full_name}</span>
                <span className="text-slate-500">{user.email}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
