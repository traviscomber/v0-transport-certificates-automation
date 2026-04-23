'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle2, Loader2, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface BulkUser {
  full_name: string
  email: string
  phone: string
  rut: string
  role: string
  is_active: boolean
}

export function ImportExecutivesForm() {
  const router = useRouter()
  const [users, setUsers] = useState<BulkUser[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [importResults, setImportResults] = useState<any>(null)

  // Load executives on mount
  useEffect(() => {
    const loadExecutives = async () => {
      try {
        console.log('[v0] Loading executives from database')
        setLoading(true)
        
        const response = await fetch('/api/admin/users/bulk-import-from-executives', {
          method: 'GET',
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `Error ${response.status}`)
        }

        const data = await response.json()
        console.log('[v0] Loaded executives:', data.users)
        
        setUsers(data.users)
        setSuccess(`${data.users.length} ejecutivos listos para importar`)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error cargando ejecutivos'
        console.error('[v0] Error loading executives:', errorMsg)
        setError(errorMsg)
      } finally {
        setLoading(false)
      }
    }

    loadExecutives()
  }, [])

  const handleImport = async () => {
    if (users.length === 0) {
      setError('No hay usuarios para importar')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      console.log('[v0] Step 0: Getting current company_id')
      
      // Step 0: Get the current company_id from cookies
      const companyIdResponse = await fetch('/api/admin/users/get-company-id')
      const companyIdData = await companyIdResponse.json()
      const companyId = companyIdData.company_id
      
      console.log('[v0] Using company_id:', companyId)
      
      if (!companyId) {
        throw new Error('No company_id found - please log in to your company first')
      }

      console.log('[v0] Step 1: Creating auth users for', users.length, 'executives')

      // Step 1: Create auth users first
      const authPayload = { executives: users.map(u => ({ email: u.email, full_name: u.full_name })) }
      const authResponse = await fetch('/api/admin/create-executives-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authPayload),
      })

      if (!authResponse.ok) {
        const authError = await authResponse.json()
        console.error('[v0] Auth creation failed:', authError)
        throw new Error(`Auth creation error: ${authError.error}`)
      }

      const authData = await authResponse.json()
      console.log('[v0] Auth users created:', authData.summary)

      // Build mapping of email to user_id for successful creations
      const userIdMap = new Map()
      authData.results.forEach((result: any) => {
        if (result.success && result.user_id) {
          userIdMap.set(result.email, result.user_id)
        }
      })

      console.log('[v0] Step 2: Creating profiles for', userIdMap.size, 'users')

      // Step 2: Create profiles with the user IDs and company_id
      const profilePayload = { 
        company_id: companyId,
        users: users
          .filter(u => userIdMap.has(u.email))
          .map(u => ({
            ...u,
            id: userIdMap.get(u.email)
          }))
      }

      const profileResponse = await fetch('/api/admin/users/bulk-import-from-executives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profilePayload),
      })

      console.log('[v0] Profile response status:', profileResponse.status)

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json()
        console.error('[v0] Profile creation error:', errorData)
        throw new Error(errorData.error || `Error ${profileResponse.status}`)
      }

      const data = await profileResponse.json()
      console.log('[v0] Import response:', data)
      
      setImportResults(data.result)
      setSuccess(data.message)
      
      // Step 3: Sync profiles to ensure database is up to date
      console.log('[v0] Step 3: Syncing profiles')
      try {
        const syncResponse = await fetch('/api/admin/sync-profiles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
        
        if (syncResponse.ok) {
          const syncData = await syncResponse.json()
          console.log('[v0] Profiles synced:', syncData.count, 'total profiles')
        } else {
          console.warn('[v0] Sync warning:', await syncResponse.json())
        }
      } catch (syncErr) {
        console.warn('[v0] Sync error (non-fatal):', syncErr)
      }
      
      // Redirect after success to company users dashboard
      setTimeout(() => {
        router.push('/dashboard/company/usuarios')
      }, 2000)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error en la importación'
      console.error('[v0] Import error:', errorMsg)
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Importar Ejecutivos de Transportes Labbe
        </CardTitle>
        <CardDescription>
          Carga automática de los ejecutivos desde la tabla de equipo
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="flex gap-3 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900 dark:text-red-200">{error}</p>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {success && !error && (
          <div className="flex gap-3 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-900 dark:text-green-200">{success}</p>
            </div>
          </div>
        )}

        {/* Users List */}
        {users.length > 0 && (
          <div className="space-y-3">
            <p className="font-medium text-sm">Ejecutivos a importar ({users.length}):</p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {users.map((user, idx) => (
                <div key={idx} className="flex items-start justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-sm">
                  <div>
                    <p className="font-medium">{user.full_name}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{user.email}</p>
                  </div>
                  <div className="text-right text-xs text-slate-600 dark:text-slate-400">
                    <p>{user.rut}</p>
                    <p>{user.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Import Results */}
        {importResults && (
          <div className="space-y-2 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="font-medium text-sm text-blue-900 dark:text-blue-200">
              ✓ {importResults.created} usuarios creados exitosamente
            </p>
            {importResults.errors && importResults.errors.length > 0 && (
              <div className="mt-3 space-y-1">
                <p className="font-medium text-sm text-red-600 dark:text-red-400">
                  ✗ {importResults.errors.length} errores:
                </p>
                {importResults.errors.map((err: any, idx: number) => (
                  <p key={idx} className="text-xs text-red-600 dark:text-red-400">
                    {err.email}: {err.error}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Import Button */}
        <Button
          onClick={handleImport}
          disabled={users.length === 0 || loading || importResults !== null}
          className="w-full bg-orange-600 hover:bg-orange-700"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Importando...
            </>
          ) : importResults ? (
            'Importación Completada'
          ) : (
            `Importar ${users.length} Ejecutivos`
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
