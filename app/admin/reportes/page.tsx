'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { ReportsDashboard } from '@/components/admin/reports-dashboard'

const AUTHORIZED_KEY = 'labbe2026'

export default function ReportesPage() {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [keyInput, setKeyInput] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [keyError, setKeyError] = useState('')

  useEffect(() => {
    // Check if user is authorized from session storage
    const authorized = sessionStorage.getItem('admin-reportes-authorized') === 'true'
    setIsAuthorized(authorized)
  }, [])

  const handleKeySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setKeyError('')

    if (keyInput === AUTHORIZED_KEY) {
      setIsAuthorized(true)
      sessionStorage.setItem('admin-reportes-authorized', 'true')
      setKeyInput('')
      setShowKey(false)
    } else {
      setKeyError('Clave incorrecta. Por favor intenta de nuevo.')
      setKeyInput('')
    }
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
        <Card className="w-full max-w-md shadow-2xl border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-t-lg border-b-2 border-primary">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Lock className="h-6 w-6" />
              Acceso Restringido
            </CardTitle>
            <CardDescription className="text-white/80">
              Ingresa la clave para ver los reportes
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <form onSubmit={handleKeySubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="key-input" className="block text-sm font-medium text-gray-700">
                  Clave de Acceso
                </label>
                <div className="relative">
                  <Input
                    id="key-input"
                    type={showKey ? 'text' : 'password'}
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    placeholder="Ingresa la clave"
                    className="pr-10 border-gray-300 focus:border-primary"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {keyError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-medium">
                  {keyError}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white font-medium h-10"
              >
                Acceder
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <ReportsDashboard />
}
